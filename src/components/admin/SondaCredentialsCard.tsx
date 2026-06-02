import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Satellite } from "lucide-react";
import { useSondaCredentialsAdmin } from "@/hooks/useSondaCredentialsAdmin";

export const SondaCredentialsCard = () => {
  const { creds, loading, saving, save } = useSondaCredentialsAdmin();
  const [form, setForm] = useState({
    username: "",
    password: "",
    auth_url: "https://consultaviagem.m2mfrota.com.br/AutenticarUsuario",
    position_url: "https://zn5.sinopticoplus.com/servico-dados/api/v1/obterPosicaoVeiculo",
    dashboard_url: "https://zn5.sinopticoplus.com/servico-dados/api/v1/obterDashboard",
  });

  useEffect(() => {
    if (creds) {
      setForm((f) => ({
        ...f,
        username: creds.username,
        auth_url: creds.auth_url ?? "",
        position_url: creds.position_url ?? "",
        dashboard_url: creds.dashboard_url ?? "",
      }));
    }
  }, [creds]);

  const handleSave = async () => {
    await save(form);
    setForm((f) => ({ ...f, password: "" }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Satellite className="w-5 h-5" /> Credenciais SONDA Mobility
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando…
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Usuário</Label>
                <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Senha</Label>
                <Input type="password" placeholder={creds ? "•••••••• (manter)" : ""} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>URL Autenticação (POST)</Label>
              <Input value={form.auth_url} onChange={(e) => setForm({ ...form, auth_url: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>URL Posição Veículo (GET)</Label>
              <Input value={form.position_url} onChange={(e) => setForm({ ...form, position_url: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>URL Dashboard (GET, opcional)</Label>
              <Input value={form.dashboard_url} onChange={(e) => setForm({ ...form, dashboard_url: e.target.value })} />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving || !form.username || (!creds && !form.password) || !form.auth_url || !form.position_url}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Salvar
              </Button>
            </div>
            {creds && (
              <p className="text-xs text-muted-foreground">
                Última atualização: {new Date(creds.updated_at).toLocaleString("pt-BR")}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};