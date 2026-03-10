import { useState } from "react";
import { useLocation } from "wouter";
import { BookOpen, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const ACCESS_CODE = "Biblioteca2024";

export default function AccessPage() {
  const [code, setCode] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === ACCESS_CODE) {
      localStorage.setItem("bibliotecaAccess", "true");
      setLocation("/");
    } else {
      toast({
        variant: "destructive",
        title: "Código incorreto",
        description: "O código de acesso que introduziu não é válido.",
      });
      setCode("");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-primary/20">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">
            Acesso Restrito
          </h1>
          <p className="text-slate-500 text-lg">
            Introduza o código de acesso da biblioteca
          </p>
        </div>

        <Card className="glass-panel p-8 border-0 rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-700 font-semibold mb-3">
                Código de Acesso
              </label>
              <Input
                type="password"
                placeholder="Introduza o código..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-12 bg-white/50 border-slate-200 focus:bg-white transition-colors rounded-xl"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              Entrar
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
