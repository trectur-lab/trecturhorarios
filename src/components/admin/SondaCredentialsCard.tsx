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
    base_url: "",
    login_path: "/login",
    vehicle_position_path: "/posicao",
    line_route_path: "/rota",
  });

  useEffect(() => {
    if (creds) {
      setForm((f) => ({
        ...f,
        username: creds.username,
        base_url: creds.base_url ?? "",
        login_path: creds.login_path ?? "/login",
        vehicle_position_path: creds.vehicle_position_path ?? "/posicao",
        line_route_path: creds.line_route_path ?? "/rota",
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
              <Label>URL Base da API</Label>
              <Input placeholder="https://api.sondamobility.com.br" value={form.base_url} onChange={(e) => setForm({ ...form, base_url: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Login path</Label>
                <Input value={form.login_path} onChange={(e) => setForm({ ...form, login_path: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Posição path</Label>
                <Input value={form.vehicle_position_path} onChange={(e) => setForm({ ...form, vehicle_position_path: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Rota path</Label>
                <Input value={form.line_route_path} onChange={(e) => setForm({ ...form, line_route_path: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving || !form.username || (!creds && !form.password) || !form.base_url}>
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