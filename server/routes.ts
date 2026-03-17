import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import * as XLSX from "xlsx";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Add CORS headers for credentials (only for cross-origin requests)
  app.use((req, res, next) => {
    const origin = req.get("origin");
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      
      if (req.method === "OPTIONS") {
        return res.sendStatus(200);
      }
    }
    next();
  });
  
  // Setup session middleware
  const SessionStore = MemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || 'biblioteca-secret',
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: { 
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Seed default admin user
  async function seedAdmin() {
    try {
      const existingAdmin = await storage.getUserByUsername("Biblioteca025");
      if (!existingAdmin) {
        // For simplicity in this demo, we store the password directly. 
        // In a real app, you should hash the password!
        const newAdmin = await storage.createUser({
          username: "Biblioteca025",
          password: "Pa$$w0rd"
        });
        console.log("Admin user created with ID:", newAdmin.id);
      } else {
        console.log("Admin user already exists with ID:", existingAdmin.id);
      }
    } catch (err) {
      console.error("Error seeding admin:", err);
    }
  }
  
  // Run seed on startup
  seedAdmin();

  // --- Auth Routes ---
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { username, password } = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(username);
      
      console.log(`Login attempt for user: ${username}`);
      
      if (!user || user.password !== password) {
        console.log(`Login failed for user: ${username}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log(`Login successful for user: ${username}, ID: ${user.id}`);
      
      // @ts-ignore
      req.session.userId = user.id;
      // @ts-ignore
      req.session.username = user.username;
      
      // Save session before responding
      req.session.save((err: any) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Erro ao guardar sessão" });
        }
        console.log("Session saved successfully");
        res.json({ message: "Logged in successfully" });
      });
    } catch (err) {
       console.error("Login error:", err);
       res.status(401).json({ message: "Invalid credentials" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    // @ts-ignore
    const userId = req.session?.userId;
    // @ts-ignore
    const username = req.session?.username;
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ username });
  });

  // Middleware to check auth for protected routes
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };

  // --- Registration Routes ---
  app.post(api.registrations.create.path, async (req, res) => {
    try {
      const input = api.registrations.create.input.parse(req.body);
      const registration = await storage.createRegistration(input);
      res.status(201).json(registration);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.registrations.list.path, requireAuth, async (req, res) => {
    const registrations = await storage.getRegistrations();
    res.json(registrations);
  });

  app.delete("/api/registrations/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    await storage.deleteRegistration(id);
    res.json({ message: "Registo apagado com sucesso" });
  });

  // Export registrations as CSV
  app.get("/api/registrations/export/csv", requireAuth, async (req, res) => {
    try {
      const registrations = await storage.getRegistrations();
      
      // Get selected month from query params or use current month
      const monthParam = req.query.month as string;
      let filteredRegs = registrations;
      
      if (monthParam) {
        const [year, month] = monthParam.split("-");
        filteredRegs = registrations.filter(reg => {
          const regDate = new Date(reg.createdAt);
          return regDate.getFullYear() === parseInt(year) && 
                 (regDate.getMonth() + 1) === parseInt(month);
        });
      }

      // Create CSV content (using semicolon separator for Portuguese Excel compatibility)
      const headers = ["Nome", "Ano", "Turma", "Atividade", "Data e Hora de Entrada"];
      const rows = filteredRegs.map(reg => [
        reg.name,
        reg.year,
        reg.className,
        reg.activity,
        new Date(reg.createdAt).toLocaleString("pt-PT")
      ]);

      let csv = headers.join(";") + "\n";
      rows.forEach(row => {
        csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";") + "\n";
      });

      // Add BOM for Excel to recognize UTF-8
      const csvWithBOM = "\uFEFF" + csv;

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=registrations.csv");
      res.send(csvWithBOM);
    } catch (err) {
      console.error("Export error:", err);
      res.status(500).json({ message: "Erro ao exportar dados" });
    }
  });

  // Export registrations as Excel
  app.get("/api/registrations/export/excel", requireAuth, async (req, res) => {
    try {
      const registrations = await storage.getRegistrations();
      
      let filteredRegs = registrations;
      const fromParam = req.query.from as string;
      const toParam = req.query.to as string;
      const monthParam = req.query.month as string;

      if (fromParam) {
        const from = new Date(fromParam);
        from.setHours(0, 0, 0, 0);
        const to = toParam ? new Date(toParam) : new Date(fromParam);
        to.setHours(23, 59, 59, 999);
        filteredRegs = registrations.filter(reg => {
          const d = new Date(reg.createdAt);
          return d >= from && d <= to;
        });
      } else if (monthParam) {
        const [year, month] = monthParam.split("-");
        filteredRegs = registrations.filter(reg => {
          const d = new Date(reg.createdAt);
          return d.getFullYear() === parseInt(year) && (d.getMonth() + 1) === parseInt(month);
        });
      }

      const rows = filteredRegs.map(reg => ({
        "Nome": reg.name,
        "Ano": reg.year,
        "Turma": reg.className,
        "Atividade": reg.activity,
        "Data": new Date(reg.createdAt).toLocaleDateString("pt-PT"),
        "Hora de Entrada": new Date(reg.createdAt).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      
      // Set column widths
      worksheet["!cols"] = [
        { wch: 30 }, // Nome
        { wch: 8 },  // Ano
        { wch: 8 },  // Turma
        { wch: 20 }, // Atividade
        { wch: 12 }, // Data
        { wch: 16 }, // Hora
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registos");

      const fileName = fromParam
        ? `registos_${fromParam}_${toParam || fromParam}.xlsx`
        : monthParam
        ? `registos_${monthParam}.xlsx`
        : `registos.xlsx`;

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      res.send(buffer);
    } catch (err) {
      console.error("Excel export error:", err);
      res.status(500).json({ message: "Erro ao exportar dados" });
    }
  });

  return httpServer;
}