import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, ArrowLeft, Key, UserCircle } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useLogin, useUser } from "@/hooks/use-auth";
import { useEffect } from "react";

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
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useUser();

  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/admin");
    }
  }, [user, isLoading, setLocation]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    console.log("Login attempt with:", data.username);
    login.mutate(data, {
      onSuccess: () => {
        console.log("Login successful");
        toast({
          title: "Sessão iniciada",
          description: "Bem-vindo ao painel de administração.",
        });
        // Wait briefly for toast to show, then redirect
        setTimeout(() => {
          window.location.href = "/admin";
        }, 500);
      },
      onError: (error) => {
        console.error("Login error:", error);
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: error.message,
          duration: 6000, // Show error for 6 seconds
        });
      },
    });
  };

  if (user && !isLoading) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dark mode decorative elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        {!isLoading && (
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Voltar ao início
          </Link>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium">A verificar autenticação...</p>
          </div>
        ) : (
          <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700/50 shadow-2xl p-8 sm:p-10 rounded-3xl">
          <div className="text-center mb-8">
            <div className="mx-auto bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-primary/30">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
              Administração
            </h1>
            <p className="text-slate-400">
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
                    <FormLabel className="text-slate-300">Utilizador</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserCircle className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
                        <Input
                          placeholder="Introduza o utilizador"
                          className="pl-11 h-12 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:bg-slate-900 transition-colors rounded-xl"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Palavra-passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Key className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-11 h-12 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:bg-slate-900 transition-colors rounded-xl"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={login.isPending}
                className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 mt-4 relative"
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
