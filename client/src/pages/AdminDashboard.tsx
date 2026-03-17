import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { format, isSameDay, isSameMonth, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { pt } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { LogOut, Users, Download, Calendar as CalendarIcon, Search, Sun, Moon, X } from "lucide-react";
import { useUser, useLogout } from "@/hooks/use-auth";
import { useRegistrations } from "@/hooks/use-registrations";
import { useTheme } from "@/lib/theme";
import logoEscola from "/logo-escola.png";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

const ACTIVITY_ICONS: Record<string, string> = {
  "estudar": "📚",
  "jogar damas": "🎲",
  "jogar xadrez": "♟",
  "ler": "📖",
  "fazer trabalho": "💼",
  "outro": "📝",
};

const getActivityIcon = (activity: string) =>
  ACTIVITY_ICONS[activity.toLowerCase()] ?? "📝";

const getActivityColor = (activity: string) => {
  switch (activity.toLowerCase()) {
    case "estudar":       return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700";
    case "jogar damas":   return "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700";
    case "jogar xadrez":  return "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700";
    case "ler":           return "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700";
    case "fazer trabalho":return "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700";
    default:              return "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
  }
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: isAuthLoading } = useUser();
  const logout = useLogout();
  const { theme, toggleTheme } = useTheme();

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentMonth] = useState<Date>(new Date());

  const [searchName, setSearchName] = useState("");
  const [searchYear, setSearchYear] = useState("");
  const [searchClass, setSearchClass] = useState("");

  const { data: registrations = [], isLoading: isRegLoading } = useRegistrations();

  useEffect(() => {
    if (!isAuthLoading && !user) setLocation("/login");
  }, [user, isAuthLoading, setLocation]);

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium">A carregar...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => logout.mutate(undefined, { onSuccess: () => setLocation("/login") });

  const handleExportExcel = () => {
    const params = new URLSearchParams();
    if (dateRange?.from) {
      params.set("from", dateRange.from.toISOString().split("T")[0]);
      const to = dateRange.to ?? dateRange.from;
      params.set("to", to.toISOString().split("T")[0]);
    } else {
      const year = currentMonth.getFullYear();
      const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
      params.set("month", `${year}-${month}`);
    }
    window.location.href = `/api/registrations/export/excel?${params.toString()}`;
  };

  // Date filter
  const dateFiltered = registrations.filter((reg) => {
    const regDate = new Date(reg.createdAt);
    if (dateRange?.from) {
      const end = dateRange.to ?? dateRange.from;
      return isWithinInterval(regDate, { start: startOfDay(dateRange.from), end: endOfDay(end) });
    }
    return isSameMonth(regDate, currentMonth);
  });

  // Search filter on top of date filter
  const displayedRegistrations = dateFiltered.filter((reg) => {
    const matchName = !searchName || reg.name.toLowerCase().includes(searchName.toLowerCase());
    const matchYear = !searchYear || reg.year.toLowerCase().includes(searchYear.toLowerCase());
    const matchClass = !searchClass || reg.className.toLowerCase().includes(searchClass.toLowerCase());
    return matchName && matchYear && matchClass;
  });

  const todayCount = registrations.filter((reg) =>
    isSameDay(new Date(reg.createdAt), new Date())
  ).length;

  const hasRange = !!dateRange?.from;
  const hasSearch = !!(searchName || searchYear || searchClass);

  const rangeLabel = hasRange
    ? dateRange.to && !isSameDay(dateRange.from!, dateRange.to)
      ? `${format(dateRange.from!, "d MMM", { locale: pt })} – ${format(dateRange.to, "d MMM yyyy", { locale: pt })}`
      : format(dateRange.from!, "d 'de' MMMM yyyy", { locale: pt })
    : format(currentMonth, "MMMM 'de' yyyy", { locale: pt });

  const colSpan = hasRange ? 4 : 5;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/40 shrink-0">
              <img src={logoEscola} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight leading-none">
                Gestão da Biblioteca
              </h1>
              <p className="text-xs text-muted-foreground">
                Sessão iniciada como <span className="font-semibold">{user.username}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground rounded-full"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
              onClick={handleLogout}
              disabled={logout.isPending}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Terminar Sessão
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <Card className="border border-border shadow-lg rounded-2xl overflow-hidden bg-card">
              <div className="bg-primary/10 dark:bg-slate-800 p-4 text-foreground flex items-center gap-3 border-b border-border">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="font-semibold leading-tight">Filtrar por Intervalo</h2>
                  <p className="text-xs text-muted-foreground">Clica para início, depois fim</p>
                </div>
              </div>
              <CardContent className="p-4 flex flex-col items-center gap-3 bg-card">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  className="rounded-xl border border-border"
                  locale={pt}
                  numberOfMonths={1}
                />
                {hasRange && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange(undefined)}
                    className="w-full rounded-lg text-muted-foreground border-border hover:border-foreground/30 text-xs"
                  >
                    Limpar seleção — ver mês todo
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-primary to-blue-700 text-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm font-medium">
                      {hasRange ? rangeLabel : "Este mês"}
                    </p>
                    <p className="text-3xl font-bold tracking-tight">
                      {isRegLoading ? "-" : dateFiltered.length}
                    </p>
                  </div>
                </div>
                {!hasRange && (
                  <div className="border-t border-white/20 pt-4 flex items-center justify-between">
                    <p className="text-blue-100 text-sm">Hoje</p>
                    <p className="text-xl font-bold">{isRegLoading ? "-" : todayCount}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main table */}
          <div className="lg:col-span-8 xl:col-span-9">
            <Card className="border border-border shadow-lg rounded-2xl h-full flex flex-col bg-card">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <CardTitle className="text-2xl text-foreground">
                      Registos de Presença
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-1">
                      {hasRange
                        ? `A mostrar registos de ${rangeLabel}`
                        : `A mostrar todos os registos de ${format(currentMonth, "MMMM 'de' yyyy", { locale: pt })}`}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportExcel}
                    className="rounded-lg text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500 border-border shrink-0"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Excel
                  </Button>
                </div>

                {/* Search filters */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nome..."
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      className="pl-8 h-9 text-sm bg-background border-border text-foreground placeholder:text-muted-foreground rounded-lg"
                    />
                    {searchName && (
                      <button onClick={() => setSearchName("")} className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      placeholder="Ano..."
                      value={searchYear}
                      onChange={(e) => setSearchYear(e.target.value)}
                      className="h-9 text-sm bg-background border-border text-foreground placeholder:text-muted-foreground rounded-lg px-3"
                    />
                    {searchYear && (
                      <button onClick={() => setSearchYear("")} className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      placeholder="Turma..."
                      value={searchClass}
                      onChange={(e) => setSearchClass(e.target.value)}
                      className="h-9 text-sm bg-background border-border text-foreground placeholder:text-muted-foreground rounded-lg px-3"
                    />
                    {searchClass && (
                      <button onClick={() => setSearchClass("")} className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                {hasSearch && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {displayedRegistrations.length} resultado{displayedRegistrations.length !== 1 ? "s" : ""} encontrado{displayedRegistrations.length !== 1 ? "s" : ""}
                  </p>
                )}
              </CardHeader>

              <CardContent className="p-0 flex-1 overflow-hidden">
                <div className="max-h-[560px] overflow-auto">
                  <Table>
                    <TableHeader className="bg-muted/40 sticky top-0 backdrop-blur-sm z-10">
                      <TableRow className="border-b border-border hover:bg-transparent">
                        <TableHead className="font-semibold text-muted-foreground py-4 pl-6">Aluno</TableHead>
                        <TableHead className="font-semibold text-muted-foreground">Ano / Turma</TableHead>
                        <TableHead className="font-semibold text-muted-foreground">Atividade</TableHead>
                        {!hasRange && (
                          <TableHead className="font-semibold text-muted-foreground">Data</TableHead>
                        )}
                        <TableHead className="font-semibold text-muted-foreground text-right pr-6">
                          {hasRange ? "Data / Hora" : "Hora"}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isRegLoading ? (
                        <TableRow>
                          <TableCell colSpan={colSpan} className="h-48 text-center text-muted-foreground">
                            A carregar dados...
                          </TableCell>
                        </TableRow>
                      ) : displayedRegistrations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={colSpan} className="h-48 text-center text-muted-foreground">
                            <div className="flex flex-col items-center justify-center">
                              <BookOpen className="w-10 h-10 text-muted-foreground/40 mb-3" />
                              <p>
                                {hasSearch
                                  ? "Nenhum registo corresponde à pesquisa."
                                  : hasRange
                                  ? "Nenhum registo encontrado para este intervalo."
                                  : "Nenhum registo encontrado para este mês."}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        displayedRegistrations.map((reg) => (
                          <TableRow
                            key={reg.id}
                            className="hover:bg-muted/30 transition-colors border-b border-border"
                          >
                            <TableCell className="font-medium text-foreground pl-6 py-4">
                              {reg.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {reg.year} - Turma {reg.className}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`font-medium px-2.5 py-1 gap-1.5 ${getActivityColor(reg.activity)}`}
                              >
                                <span>{getActivityIcon(reg.activity)}</span>
                                <span>{reg.activity.charAt(0).toUpperCase() + reg.activity.slice(1)}</span>
                              </Badge>
                            </TableCell>
                            {!hasRange && (
                              <TableCell className="text-muted-foreground">
                                {format(new Date(reg.createdAt), "dd/MM", { locale: pt })}
                              </TableCell>
                            )}
                            <TableCell className="text-right text-muted-foreground font-medium pr-6">
                              {hasRange
                                ? format(new Date(reg.createdAt), "dd/MM HH:mm")
                                : format(new Date(reg.createdAt), "HH:mm")}
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
