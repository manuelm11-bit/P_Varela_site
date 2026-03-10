import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup session middleware
  const SessionStore = MemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || 'biblioteca-secret',
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: { secure: process.env.NODE_ENV === "production" }
  }));

  // Seed default admin user
  async function seedAdmin() {
    const existingAdmin = await storage.getUserByUsername("Biblioteca025");
    if (!existingAdmin) {
      // For simplicity in this demo, we store the password directly. 
      // In a real app, you should hash the password!
      await storage.createUser({
        username: "Biblioteca025",
        password: "Pa$$w0rd"
      });
      console.log("Admin user seeded.");
    }
  }
  
  seedAdmin().catch(console.error);

  // --- Auth Routes ---
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { username, password } = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // @ts-ignore
      req.session.userId = user.id;
      // @ts-ignore
      req.session.username = user.username;
      
      res.json({ message: "Logged in successfully" });
    } catch (err) {
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
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    // @ts-ignore
    res.json({ username: req.session.username });
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

  return httpServer;
}