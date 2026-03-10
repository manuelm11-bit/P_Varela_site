import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BookOpen, User, Calendar, BookOpenCheck, Lock } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useCreateRegistration } from "@/hooks/use-registrations";

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

export default function RegistrationPage() {
  const { toast } = useToast();
  const createRegistration = useCreateRegistration();

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      year: "",
      className: "",
      activity: "",
    },
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
        toast({
          variant: "destructive",
          title: "Erro",
          description: error.message,
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-primary/20">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">
            Biblioteca Escolar
          </h1>
          <p className="text-slate-500 text-lg">
            Regista a tua presença e atividade de hoje.
          </p>
        </div>

        <Card className="glass-panel p-8 md:p-10 border-0 rounded-3xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">Nome Completo</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                        <Input
                          placeholder="Ex: Ana Silva"
                          className="pl-11 h-12 bg-white/50 border-slate-200 focus:bg-white transition-colors rounded-xl"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">Ano</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                          <Input
                            placeholder="Ex: 10º"
                            className="pl-11 h-12 bg-white/50 border-slate-200 focus:bg-white transition-colors rounded-xl"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="className"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">Turma</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: A"
                          className="h-12 bg-white/50 border-slate-200 focus:bg-white transition-colors rounded-xl px-4"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="activity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">O que vens fazer?</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <div className="relative">
                          <BookOpenCheck className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 z-10" />
                          <SelectTrigger className="pl-11 h-12 bg-white/50 border-slate-200 focus:bg-white transition-colors rounded-xl">
                            <SelectValue placeholder="Selecione uma atividade..." />
                          </SelectTrigger>
                        </div>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="estudar">Estudar</SelectItem>
                        <SelectItem value="jogar damas">Jogar Damas</SelectItem>
                        <SelectItem value="jogar xadrez">Jogar Xadrez</SelectItem>
                        <SelectItem value="ler">Ler</SelectItem>
                        <SelectItem value="fazer trabalho">Fazer Trabalho</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
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
            className="inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors bg-white/50 px-4 py-2 rounded-full border border-slate-200/50 hover:bg-white shadow-sm"
          >
            <Lock className="w-4 h-4" />
            Acesso Restrito
          </Link>
        </div>
      </div>
    </div>
  );
}
