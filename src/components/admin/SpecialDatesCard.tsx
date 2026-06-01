import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Trash2 } from "lucide-react";
import { useSpecialDates, OverrideKind } from "@/hooks/useSpecialDates";
import { useBusLinesAdmin } from "@/hooks/useBusLinesAdmin";

const OVERRIDE_OPTIONS: { value: OverrideKind; label: string }[] = [
  { value: "uteis", label: "Dias Úteis" },
  { value: "sabados", label: "Sábados" },
  { value: "domingos", label: "Domingos/Feriados" },
  { value: "no_service", label: "Sem operação" },
];

export const SpecialDatesCard = () => {
  const { dates, overrides, createDate, deleteDate, upsertOverride, removeOverride } = useSpecialDates();
  const { busLines } = useBusLinesAdmin();
  const [newDate, setNewDate] = useState({ date: "", description: "", default_override: "domingos" as OverrideKind });
  const [lineOverride, setLineOverride] = useState({
    special_date_id: "",
    bus_line_id: "",
    override: "no_service" as OverrideKind,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarDays className="w-5 h-5" /> Datas especiais e exceções por linha
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div className="space-y-1.5">
            <Label>Data</Label>
            <Input type="date" value={newDate.date} onChange={(e) => setNewDate({ ...newDate, date: e.target.value })} />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label>Descrição</Label>
            <Input value={newDate.description} onChange={(e) => setNewDate({ ...newDate, description: e.target.value })} placeholder="Ex.: Feriado de Natal" />
          </div>
          <div className="space-y-1.5">
            <Label>Padrão</Label>
            <Select value={newDate.default_override} onValueChange={(v) => setNewDate({ ...newDate, default_override: v as OverrideKind })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {OVERRIDE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-4 flex justify-end">
            <Button
              onClick={() => {
                if (!newDate.date) return;
                createDate({ date: newDate.date, description: newDate.description || null, default_override: newDate.default_override });
                setNewDate({ date: "", description: "", default_override: "domingos" });
              }}
            >Adicionar data</Button>
          </div>
        </div>

        <div className="space-y-2 max-h-72 overflow-auto border-t border-border pt-3">
          {dates.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma data especial.</p>}
          {dates.map((d) => (
            <div key={d.id} className="border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <strong>{d.date}</strong> · {d.description || "—"} · padrão: <em>{d.default_override ?? "—"}</em>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteDate(d.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              <div className="space-y-1">
                {overrides.filter((o) => o.special_date_id === d.id).map((o) => {
                  const line = busLines.find((l) => l.id === o.bus_line_id);
                  return (
                    <div key={o.id} className="flex items-center justify-between text-xs bg-secondary/50 rounded px-2 py-1">
                      <span>{line?.numero ?? o.bus_line_id} — {OVERRIDE_OPTIONS.find((op) => op.value === o.override)?.label}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeOverride(o.id)}>
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-3 space-y-2">
          <Label className="text-sm">Exceção por linha</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
            <Select value={lineOverride.special_date_id} onValueChange={(v) => setLineOverride({ ...lineOverride, special_date_id: v })}>
              <SelectTrigger><SelectValue placeholder="Data" /></SelectTrigger>
              <SelectContent>
                {dates.map((d) => <SelectItem key={d.id} value={d.id}>{d.date}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={lineOverride.bus_line_id} onValueChange={(v) => setLineOverride({ ...lineOverride, bus_line_id: v })}>
              <SelectTrigger><SelectValue placeholder="Linha" /></SelectTrigger>
              <SelectContent>
                {busLines.map((l) => <SelectItem key={l.id} value={String(l.id)}>{l.numero} — {l.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={lineOverride.override} onValueChange={(v) => setLineOverride({ ...lineOverride, override: v as OverrideKind })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {OVERRIDE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                if (!lineOverride.special_date_id || !lineOverride.bus_line_id) return;
                upsertOverride({
                  special_date_id: lineOverride.special_date_id,
                  bus_line_id: Number(lineOverride.bus_line_id),
                  override: lineOverride.override,
                });
              }}
            >Salvar exceção</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};