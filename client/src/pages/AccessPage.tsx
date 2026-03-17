import { useState } from "react";
import { useLocation } from "wouter";
import { Lock, Eye, EyeOff, Sun, Moon } from "lucide-react";
import logoEscola from "/logo-escola.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/lib/theme";

const ACCESS_CODE = "Varela026";

export default function AccessPage() {
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() === ACCESS_CODE) {
      localStorage.setItem("bibliotecaAccess", "true");
      window.location.href = "/";
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

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto w-24 h-24 rounded-full overflow-hidden mb-6 shadow-xl border-2 border-primary/40">
            <img src={logoEscola} alt="Agrupamento de Escolas de Montijo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-3">
            Acesso Restrito
          </h1>
          <p className="text-muted-foreground text-lg">
            Introduza o código de acesso da biblioteca
          </p>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 p-8 rounded-3xl shadow-2xl shadow-black/10 dark:shadow-black/80">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-foreground font-semibold mb-3">
                Código de Acesso
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input
                  type={showCode ? "text" : "password"}
                  placeholder="Introduza o código..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="pl-11 pr-11 h-12 bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-foreground placeholder:text-muted-foreground focus:bg-white dark:focus:bg-slate-700 transition-colors rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowCode((v) => !v)}
                  className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
