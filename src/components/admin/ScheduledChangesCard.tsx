import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, CalendarClock } from "lucide-react";
import { useScheduledChanges } from "@/hooks/useScheduledChanges";
import { useBusLinesAdmin } from "@/hooks/useBusLinesAdmin";

export const ScheduledChangesCard = () => {
  const { items, create, remove } = useScheduledChanges();
  const { busLines } = useBusLinesAdmin();
  const [form, setForm] = useState({
    bus_line_id: "",
    change_type: "edit" as "edit" | "replace_all",
    day_type: "uteis" as "uteis" | "sabados" | "domingos",
    direction: "",
    target_hora: "",
    new_hora: "",
    new_obs: "",
    scheduled_for: new Date().toISOString().slice(0, 10),
  });

  const handleAdd = async () => {
    if (!form.bus_line_id || !form.scheduled_for) return;
    const ok = await create({
      bus_line_id: Number(form.bus_line_id),
      change_type: form.change_type,
      day_type: form.day_type,
      direction: form.direction || null,
      target_hora: form.target_hora || null,
      new_hora: form.new_hora || null,
      new_obs: form.new_obs || null,
      payload: null,
      scheduled_for: form.scheduled_for,
    });
    if (ok) setForm({ ...form, target_hora: "", new_hora: "", new_obs: "" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarClock className="w-5 h-5" /> Mudanças de horário agendadas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label>Linha</Label>
            <Select value={form.bus_line_id} onValueChange={(v) => setForm({ ...form, bus_line_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {busLines.map((l) => (
                  <SelectItem key={l.id} value={String(l.id)}>{l.numero} — {l.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={form.change_type} onValueChange={(v) => setForm({ ...form, change_type: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="edit">Editar 1 horário</SelectItem>
                <SelectItem value="replace_all">Substituir grade</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Dia</Label>
            <Select value={form.day_type} onValueChange={(v) => setForm({ ...form, day_type: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="uteis">Úteis</SelectItem>
                <SelectItem value="sabados">Sábados</SelectItem>
                <SelectItem value="domingos">Domingos/Feriados</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Data efetiva</Label>
            <Input type="date" value={form.scheduled_for} onChange={(e) => setForm({ ...form, scheduled_for: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Direção (opcional)</Label>
            <Input value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Hora alvo</Label>
            <Input placeholder="08:30" value={form.target_hora} onChange={(e) => setForm({ ...form, target_hora: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Nova hora</Label>
            <Input placeholder="08:35" value={form.new_hora} onChange={(e) => setForm({ ...form, new_hora: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Nova obs</Label>
            <Input value={form.new_obs} onChange={(e) => setForm({ ...form, new_obs: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleAdd}>Agendar</Button>
        </div>
        <div className="border-t border-border pt-3 space-y-2 max-h-72 overflow-auto">
          {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma mudança agendada.</p>}
          {items.map((c) => {
            const line = busLines.find((l) => l.id === c.bus_line_id);
            return (
              <div key={c.id} className="flex items-center justify-between gap-3 text-sm border border-border rounded-lg p-2">
                <div>
                  <strong>{line?.numero ?? c.bus_line_id}</strong> · {c.change_type} · {c.day_type ?? "—"} · {c.scheduled_for}
                  {c.target_hora && <> · {c.target_hora} → {c.new_hora}</>}
                  {c.applied_at && <span className="text-emerald-500 ml-2">(aplicado)</span>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(c.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};