import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Key, UserCircle, Eye, EyeOff, Sun, Moon } from "lucide-react";
import logoEscola from "/logo-escola.png";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useLogin, useUser } from "@/hooks/use-auth";
import { useEffect } from "react";
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
import { Card } from "@/components/ui/card";

const loginSchema = z.object({
  username: z.string().min(1, "Utilizador é obrigatório"),
  password: z.string().min(1, "Palavra-passe é obrigatória"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const login = useLogin();
  const { data: user, isLoading } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/admin");
    }
  }, [user, isLoading, setLocation]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    login.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Sessão iniciada",
          description: "Bem-vindo ao painel de administração.",
        });
        setLocation("/admin");
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: error.message,
          duration: 6000,
        });
      },
    });
  };

  if (user && !isLoading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-full"
      >
        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </Button>

      <div className="w-full max-w-md relative z-10">
        {!isLoading && (
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Voltar ao início
          </Link>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground font-medium">A verificar autenticação...</p>
          </div>
        ) : (
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 shadow-2xl p-8 sm:p-10 rounded-3xl">
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 rounded-full overflow-hidden mb-6 shadow-xl border-2 border-primary/40">
                <img src={logoEscola} alt="Agrupamento de Escolas de Montijo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">
                Administração
              </h1>
              <p className="text-muted-foreground">
                Acesso reservado a funcionários
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">Utilizador</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <UserCircle className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="Introduza o utilizador"
                            className="pl-11 h-12 bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-foreground placeholder:text-muted-foreground focus:bg-white dark:focus:bg-slate-900 transition-colors rounded-xl"
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">Palavra-passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Key className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-11 pr-11 h-12 bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-foreground placeholder:text-muted-foreground focus:bg-white dark:focus:bg-slate-900 transition-colors rounded-xl"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={login.isPending}
                  className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 mt-4"
                >
                  {login.isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      A verificar credenciais...
                    </div>
                  ) : "Entrar"}
                </Button>
              </form>
            </Form>
          </Card>
        )}
      </div>
    </div>
  );
}
