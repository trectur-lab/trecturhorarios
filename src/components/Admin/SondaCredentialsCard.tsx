import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  useSondaCredentialsAdmin,
  DEFAULT_AUTH_URL,
  DEFAULT_DATA_URL,
} from "@/hooks/useSondaCredentialsAdmin";
import { Loader2, MapPin, Eye, EyeOff, Plug, Route } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const SondaCredentialsCard = () => {
  const { credentials, loading, saving, testing, save, testConnection } =
    useSondaCredentialsAdmin();
  const [form, setForm] = useState({
    auth_url: "",
    data_url: "",
    usuario: "",
    senha: "",
  });
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [probing, setProbing] = useState(false);
  const [probeNumero, setProbeNumero] = useState("");
  const [probeResult, setProbeResult] = useState<any>(null);

  const runProbe = async () => {
    setProbing(true);
    setProbeResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("sonda-line-route", {
        body: { probe: true, numeroLinha: probeNumero.trim() || undefined },
      });
      if (error) {
        toast.error(error.message ?? "Erro no diagnóstico");
        return;
      }
      setProbeResult(data);
      const ok = (data?.attempts ?? []).find((a: any) => a.shapeLength > 0);
      if (ok) toast.success(`Endpoint com traçado: ${ok.endpoint}`);
      else toast.message("Nenhum endpoint retornou traçado válido.");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro inesperado");
    } finally {
      setProbing(false);
    }
  };

  const startEdit = () => {
    setForm({
      auth_url: credentials?.auth_url || DEFAULT_AUTH_URL,
      data_url: credentials?.data_url || DEFAULT_DATA_URL,
      usuario: credentials?.usuario ?? "",
      senha: credentials?.senha ?? "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (!form.usuario.trim() || !form.senha.trim()) return;
    const ok = await save({
      auth_url: (form.auth_url.trim() || DEFAULT_AUTH_URL).replace(/\/+$/, ""),
      data_url: (form.data_url.trim() || DEFAULT_DATA_URL).replace(/\/+$/, ""),
      usuario: form.usuario.trim(),
      senha: form.senha,
    });
    if (ok) setEditing(false);
  };

  const isConfigured = !!credentials?.usuario && !!credentials?.senha;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Credenciais SONDA Mobility
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Usadas pelo mapa para obter a posição GPS dos veículos. Apenas administradores.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
          </div>
        ) : !editing ? (
          <>
            <div className="space-y-2 text-sm">
              <Row label="Status">
                <span
                  className={
                    isConfigured
                      ? "text-green-500 font-medium"
                      : "text-amber-500 font-medium"
                  }
                >
                  {isConfigured ? "Configurado" : "Não configurado"}
                </span>
              </Row>
              <Row label="URL Auth">
                <span className="font-mono text-xs break-all">
                  {credentials?.auth_url || DEFAULT_AUTH_URL}
                </span>
              </Row>
              <Row label="URL Posição">
                <span className="font-mono text-xs break-all">
                  {credentials?.data_url || DEFAULT_DATA_URL}
                </span>
              </Row>
              <Row label="Usuário">
                <span className="font-mono text-xs">
                  {credentials?.usuario || "—"}
                </span>
              </Row>
              <Row label="Senha">
                <span className="font-mono text-xs">
                  {credentials?.senha ? "••••••••" : "—"}
                </span>
              </Row>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={startEdit} size="sm" variant="outline">
                {isConfigured ? "Editar credenciais" : "Configurar credenciais"}
              </Button>
              {isConfigured && (
                <Button
                  onClick={testConnection}
                  size="sm"
                  variant="secondary"
                  disabled={testing}
                >
                  {testing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Plug className="w-4 h-4 mr-1" />
                  )}
                  Testar conexão
                </Button>
              )}
            </div>

            {isConfigured && (
              <div className="border border-border rounded-md p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Route className="w-4 h-4" /> Diagnóstico de traçado da linha
                </div>
                <p className="text-xs text-muted-foreground">
                  Testa endpoints candidatos da SONDA para descobrir qual retorna o traçado (polyline) da linha. Informe um número de linha já cadastrado com <code>sonda_id_linha</code> para um teste mais preciso.
                </p>
                <div className="flex flex-wrap gap-2 items-center">
                  <Input
                    placeholder="Nº da linha (ex: 01)"
                    value={probeNumero}
                    onChange={(e) => setProbeNumero(e.target.value)}
                    className="w-40 h-9"
                  />
                  <Button
                    onClick={runProbe}
                    size="sm"
                    variant="secondary"
                    disabled={probing}
                  >
                    {probing ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <Route className="w-4 h-4 mr-1" />
                    )}
                    Testar traçado
                  </Button>
                </div>
                {probeResult && (
                  <pre className="text-[10px] leading-tight bg-muted/40 p-2 rounded max-h-64 overflow-auto whitespace-pre-wrap break-all">
{JSON.stringify(probeResult, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label>URL de Autenticação</Label>
              <Input
                placeholder={DEFAULT_AUTH_URL}
                value={form.auth_url}
                onChange={(e) => setForm({ ...form, auth_url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>URL de Posição</Label>
              <Input
                placeholder={DEFAULT_DATA_URL}
                value={form.data_url}
                onChange={(e) => setForm({ ...form, data_url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Usuário</Label>
              <Input
                value={form.usuario}
                onChange={(e) => setForm({ ...form, usuario: e.target.value })}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Mostrar/ocultar senha"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} size="sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Salvar
              </Button>
              <Button
                onClick={() => setEditing(false)}
                variant="outline"
                size="sm"
                disabled={saving}
              >
                Cancelar
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const Row = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start gap-2">
    <span className="text-muted-foreground w-24 shrink-0">{label}:</span>
    <div className="flex-1 min-w-0">{children}</div>
  </div>
);
