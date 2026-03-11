import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { format, isSameDay } from "date-fns";
import { pt } from "date-fns/locale";
import { LogOut, LayoutDashboard, Calendar as CalendarIcon, Users, Download } from "lucide-react";
import { useUser, useLogout } from "@/hooks/use-auth";
import { useRegistrations } from "@/hooks/use-registrations";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: isAuthLoading, error: authError } = useUser();
  const logout = useLogout();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const { data: registrations = [], isLoading: isRegLoading } = useRegistrations();

  useEffect(() => {
    console.log("Auth state:", { user, isAuthLoading, error: authError });
    if (!isAuthLoading && !user) {
      console.log("Not authenticated, redirecting to login");
      setLocation("/login");
    }
  }, [user, isAuthLoading, authError, setLocation]);

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">A carregar...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => setLocation("/login"),
    });
  };

  const handleExportCSV = () => {
    const monthStr = selectedDate 
      ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}`
      : "";
    const url = `/api/registrations/export/csv${monthStr ? `?month=${monthStr}` : ""}`;
    window.location.href = url;
  };

  // Filter registrations by selected date
  const filteredRegistrations = registrations.filter((reg) => {
    if (!selectedDate) return true;
    const regDate = new Date(reg.createdAt);
    return isSameDay(regDate, selectedDate);
  });

  const getActivityColor = (activity: string) => {
    switch (activity.toLowerCase()) {
      case "estudar": return "bg-blue-900/40 text-blue-300 border-blue-700";
      case "jogar damas": return "bg-orange-900/40 text-orange-300 border-orange-700";
      case "jogar xadrez": return "bg-purple-900/40 text-purple-300 border-purple-700";
      case "ler": return "bg-emerald-900/40 text-emerald-300 border-emerald-700";
      case "fazer trabalho": return "bg-rose-900/40 text-rose-300 border-rose-700";
      default: return "bg-slate-700 text-slate-300 border-slate-600";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top Navigation Bar */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-none">
                Gestão da Biblioteca
              </h1>
              <p className="text-xs text-slate-400">
                Sessão iniciada como <span className="font-semibold">{user.username}</span>
              </p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            className="text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded-xl transition-colors"
            onClick={handleLogout}
            disabled={logout.isPending}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Terminar Sessão
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar / Calendar Column */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <Card className="border-0 shadow-lg shadow-black/40 rounded-2xl overflow-hidden">
              <div className="bg-slate-800 p-4 text-white flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Selecionar Data</h2>
              </div>
              <CardContent className="p-4 flex justify-center bg-slate-900">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-xl border border-slate-700"
                  locale={pt}
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg shadow-black/40 rounded-2xl bg-gradient-to-br from-primary to-blue-700 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total de alunos hoje</p>
                    <p className="text-3xl font-bold tracking-tight">
                      {isRegLoading ? "-" : filteredRegistrations.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content / Table Column */}
          <div className="lg:col-span-8 xl:col-span-9">
            <Card className="border-0 shadow-lg shadow-black/40 rounded-2xl h-full flex flex-col bg-slate-800">
              <CardHeader className="border-b border-slate-700 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl text-white">
                      Registos de Presença
                    </CardTitle>
                    <CardDescription className="text-slate-400 mt-1">
                      {selectedDate 
                        ? `A mostrar alunos que visitaram a biblioteca em ${format(selectedDate, "dd 'de' MMMM, yyyy", { locale: pt })}` 
                        : "Selecione uma data para filtrar."}
                    </CardDescription>
                  </div>
                  
                  <div className="flex gap-2 shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleExportCSV}
                      className="rounded-lg text-slate-400 hover:text-green-400 hover:border-green-600 border-slate-600"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar CSV
                    </Button>
                    {selectedDate && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedDate(undefined)}
                        className="shrink-0 rounded-lg text-slate-400 border-slate-600 hover:border-slate-500"
                      >
                        Mostrar Todos
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0 flex-1 overflow-hidden">
                <div className="max-h-[600px] overflow-auto">
                  <Table>
                    <TableHeader className="bg-slate-800/50 sticky top-0 backdrop-blur-sm z-10">
                      <TableRow className="border-b border-slate-700 hover:bg-transparent">
                        <TableHead className="font-semibold text-slate-300 py-4 pl-6">Aluno</TableHead>
                        <TableHead className="font-semibold text-slate-300">Ano / Turma</TableHead>
                        <TableHead className="font-semibold text-slate-300">Atividade</TableHead>
                        <TableHead className="font-semibold text-slate-300 text-right pr-6">Hora de Entrada</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isRegLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-48 text-center text-slate-400">
                            A carregar dados...
                          </TableCell>
                        </TableRow>
                      ) : filteredRegistrations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-48 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center">
                              <BookOpen className="w-10 h-10 text-slate-600 mb-3" />
                              <p>Nenhum registo encontrado para este dia.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRegistrations.map((reg) => (
                          <TableRow key={reg.id} className="hover:bg-slate-700/40 transition-colors border-b border-slate-700">
                            <TableCell className="font-medium text-white pl-6 py-4">
                              {reg.name}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {reg.year} - Turma {reg.className}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`font-medium px-2.5 py-1 ${getActivityColor(reg.activity)}`}>
                                {reg.activity}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-slate-400 font-medium pr-6">
                              {format(new Date(reg.createdAt), "HH:mm")}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
