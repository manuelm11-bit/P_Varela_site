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
  const { data: user, isLoading: isAuthLoading } = useUser();
  const logout = useLogout();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const { data: registrations = [], isLoading: isRegLoading } = useRegistrations();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      setLocation("/login");
    }
  }, [user, isAuthLoading, setLocation]);

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">A carregar...</p>
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
      case "estudar": return "bg-blue-100 text-blue-800 border-blue-200";
      case "jogar damas": return "bg-orange-100 text-orange-800 border-orange-200";
      case "jogar xadrez": return "bg-purple-100 text-purple-800 border-purple-200";
      case "ler": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "fazer trabalho": return "bg-rose-100 text-rose-800 border-rose-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                Gestão da Biblioteca
              </h1>
              <p className="text-xs text-slate-500">
                Sessão iniciada como <span className="font-semibold">{user.username}</span>
              </p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            className="text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
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
            <Card className="border-0 shadow-lg shadow-slate-200/40 rounded-2xl overflow-hidden">
              <div className="bg-slate-900 p-4 text-white flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-primary-foreground" />
                <h2 className="font-semibold">Selecionar Data</h2>
              </div>
              <CardContent className="p-4 flex justify-center bg-white">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-xl border border-slate-100"
                  locale={pt}
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg shadow-slate-200/40 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white">
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
            <Card className="border-0 shadow-lg shadow-slate-200/40 rounded-2xl h-full flex flex-col">
              <CardHeader className="border-b border-slate-100 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl text-slate-800">
                      Registos de Presença
                    </CardTitle>
                    <CardDescription className="text-slate-500 mt-1">
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
                      className="rounded-lg text-slate-500 hover:text-green-600 hover:border-green-200"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar CSV
                    </Button>
                    {selectedDate && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedDate(undefined)}
                        className="shrink-0 rounded-lg text-slate-500"
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
                    <TableHeader className="bg-slate-50/80 sticky top-0 backdrop-blur-sm z-10">
                      <TableRow className="border-b border-slate-200 hover:bg-transparent">
                        <TableHead className="font-semibold text-slate-700 py-4 pl-6">Aluno</TableHead>
                        <TableHead className="font-semibold text-slate-700">Ano / Turma</TableHead>
                        <TableHead className="font-semibold text-slate-700">Atividade</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-right pr-6">Hora de Entrada</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isRegLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-48 text-center text-slate-500">
                            A carregar dados...
                          </TableCell>
                        </TableRow>
                      ) : filteredRegistrations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-48 text-center text-slate-500">
                            <div className="flex flex-col items-center justify-center">
                              <BookOpen className="w-10 h-10 text-slate-300 mb-3" />
                              <p>Nenhum registo encontrado para este dia.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRegistrations.map((reg) => (
                          <TableRow key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                            <TableCell className="font-medium text-slate-900 pl-6 py-4">
                              {reg.name}
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {reg.year} - Turma {reg.className}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`font-medium px-2.5 py-1 ${getActivityColor(reg.activity)}`}>
                                {reg.activity}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-slate-500 font-medium pr-6">
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
