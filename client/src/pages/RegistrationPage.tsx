import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Calendar, Lock, Sun, Moon } from "lucide-react";
import logoEscola from "/logo-escola.png";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useCreateRegistration } from "@/hooks/use-registrations";
import { useTheme } from "@/lib/theme";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

const registrationSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  year: z.string().min(1, "Ano é obrigatório"),
  className: z.string().min(1, "Turma é obrigatória"),
  activity: z.string().min(1, "Selecione uma atividade"),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

const ACTIVITIES = [
  { value: "estudar", label: "Estudar", icon: "📚" },
  { value: "jogar damas", label: "Jogar Damas", icon: "🎲" },
  { value: "jogar xadrez", label: "Jogar Xadrez", icon: "♟" },
  { value: "ler", label: "Ler", icon: "📖" },
  { value: "fazer trabalho", label: "Fazer Trabalho", icon: "💼" },
  { value: "outro", label: "Outro", icon: "📝" },
];

export default function RegistrationPage() {
  const { toast } = useToast();
  const createRegistration = useCreateRegistration();
  const { theme, toggleTheme } = useTheme();

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { name: "", year: "", className: "", activity: "" },
  });

  const onSubmit = (data: RegistrationFormValues) => {
    createRegistration.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Sucesso!",
          description: "O teu registo foi gravado com sucesso. Bom trabalho!",
        });
        form.reset();
      },
      onError: (error) => {
        toast({ variant: "destructive", title: "Erro", description: error.message });
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-full"
      >
        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </Button>

      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto w-24 h-24 rounded-full overflow-hidden mb-6 shadow-xl border-2 border-primary/40">
            <img src={logoEscola} alt="Agrupamento de Escolas de Montijo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-3">
            Biblioteca Escolar
          </h1>
          <p className="text-muted-foreground text-lg">
            Regista a tua presença e atividade de hoje.
          </p>
        </div>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 p-8 md:p-10 rounded-3xl shadow-xl shadow-black/10 dark:shadow-black/50">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">Nome Completo</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder="Ex: Ana Silva"
                          className="pl-11 h-12 bg-slate-100 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-foreground placeholder:text-muted-foreground focus:bg-white dark:focus:bg-slate-700 transition-colors rounded-xl"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-semibold">Ano</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="Ex: 10º"
                            className="pl-11 h-12 bg-slate-100 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-foreground placeholder:text-muted-foreground focus:bg-white dark:focus:bg-slate-700 transition-colors rounded-xl"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="className"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-semibold">Turma</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: A"
                          className="h-12 bg-slate-100 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-foreground placeholder:text-muted-foreground focus:bg-white dark:focus:bg-slate-700 transition-colors rounded-xl px-4"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="activity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">O que vens fazer?</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 bg-slate-100 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-foreground focus:bg-white dark:focus:bg-slate-700 transition-colors rounded-xl px-4">
                          <SelectValue placeholder="Selecione uma atividade..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        {ACTIVITIES.map((a) => (
                          <SelectItem key={a.value} value={a.value} className="text-foreground">
                            <span className="flex items-center gap-2">
                              <span>{a.icon}</span>
                              <span>{a.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={createRegistration.isPending}
                className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 mt-4"
              >
                {createRegistration.isPending ? "A Registar..." : "Registar Presença"}
              </Button>
            </form>
          </Form>
        </Card>

        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700/50 shadow-sm"
          >
            <Lock className="w-4 h-4" />
            Acesso Restrito
          </Link>
        </div>
      </div>
    </div>
  );
}
