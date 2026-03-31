import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, Loader2, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const ImportData = () => {
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState<"idle" | "updating" | "success" | "error" | "mismatch">("idle");
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const [stats, setStats] = useState<{ lines: number; schedules: number } | null>(null);
  const { toast } = useToast();

  const updateApp = async () => {
    setUpdating(true);
    setStatus("updating");

    try {
      // Count lines
      const { count: linesCount, error: linesError } = await supabase
        .from("bus_lines")
        .select("*", { count: "exact", head: true });

      if (linesError) throw linesError;

      // Count all schedules (paginated to get accurate count beyond 1000)
      const { count: schedulesCount, error: schedulesError } = await supabase
        .from("bus_schedules")
        .select("*", { count: "exact", head: true });

      if (schedulesError) throw schedulesError;

      const totalLines = linesCount || 0;
      const totalSchedules = schedulesCount || 0;

      console.log(`[DEBUG] Atualizar APP: ${totalLines} linhas, ${totalSchedules} horários no banco`);

      // Validate: at least some data exists
      if (totalLines === 0 || totalSchedules === 0) {
        setStats({ lines: totalLines, schedules: totalSchedules });
        setStatus("mismatch");
        toast({
          title: "Dados insuficientes",
          description: `${totalLines} linhas e ${totalSchedules} horários encontrados. Cadastre dados antes de atualizar.`,
          variant: "destructive",
        });
        setUpdating(false);
        return;
      }

      // Verify each line has at least one schedule
      const { data: linesWithSchedules, error: verifyError } = await supabase
        .from("bus_lines")
        .select("id, numero");

      if (verifyError) throw verifyError;

      const linesWithoutSchedules: string[] = [];
      for (const line of (linesWithSchedules || [])) {
        const { count, error } = await supabase
          .from("bus_schedules")
          .select("*", { count: "exact", head: true })
          .eq("bus_line_id", line.id);
        
        if (!error && (count === null || count === 0)) {
          linesWithoutSchedules.push(line.numero);
        }
      }

      if (linesWithoutSchedules.length > 0) {
        console.warn(`[DEBUG] Linhas sem horários: ${linesWithoutSchedules.join(', ')}`);
      }

      const now = new Date().toISOString();
      setLastUpdateTime(now);
      setStats({ lines: totalLines, schedules: totalSchedules });
      setStatus("success");
      toast({
        title: "APP Atualizado!",
        description: `${totalLines} linhas e ${totalSchedules} horários disponíveis no app público.${linesWithoutSchedules.length > 0 ? ` Atenção: linhas sem horários: ${linesWithoutSchedules.join(', ')}` : ''}`,
      });
    } catch (error: any) {
      console.error("Update error:", error);
      setStatus("error");
      toast({
        title: "Erro na atualização",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao painel
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Atualizar APP</CardTitle>
                <CardDescription>
                  Verifique e publique os dados do painel para o app público
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Ao clicar em <strong>"Atualizar APP"</strong>, os dados cadastrados no painel 
                serão verificados e disponibilizados para todos os usuários do aplicativo público. 
                O banco de dados do painel é a única fonte de verdade.
              </p>
            </div>

            {status === "idle" && (
              <Button onClick={updateApp} className="w-full" size="lg">
                <RefreshCw className="w-5 h-5 mr-2" />
                Atualizar APP
              </Button>
            )}

            {status === "updating" && (
              <Button disabled className="w-full" size="lg">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Verificando...
              </Button>
            )}

            {status === "success" && (
              <div className="space-y-3">
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="text-primary font-medium">APP atualizado com sucesso!</span>
                  </div>
                  {stats && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {stats.lines} linhas • {stats.schedules} horários disponíveis
                    </p>
                  )}
                  {lastUpdateTime && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Atualizado em: {new Date(lastUpdateTime).toLocaleString("pt-BR")}
                    </p>
                  )}
                </div>
                <Button onClick={() => setStatus("idle")} variant="outline" className="w-full">
                  Verificar novamente
                </Button>
              </div>
            )}

            {status === "mismatch" && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <span className="text-yellow-700 font-medium">Dados insuficientes</span>
                    {stats && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.lines} linhas • {stats.schedules} horários encontrados.
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Cadastre linhas e horários no painel antes de atualizar o app.
                    </p>
                  </div>
                </div>
                <Button onClick={() => setStatus("idle")} variant="outline" className="w-full">
                  Tentar novamente
                </Button>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <span className="text-destructive">Erro durante a verificação</span>
                </div>
                <Button onClick={() => setStatus("idle")} variant="outline" className="w-full">
                  Tentar novamente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImportData;