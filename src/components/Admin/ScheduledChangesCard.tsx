import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CalendarClock, Plus, Play, X, Trash2, Pencil, Loader2 } from "lucide-react";
import { useScheduledChanges, DayType, ScheduledChange } from "@/hooks/useScheduledChanges";
import { BusLine } from "@/hooks/useBusLinesAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  busLines: BusLine[];
}

interface DraftItem {
  hora: string;
  obs: string;
}

const dayLabel = (t: string) =>
  ({ uteis: "Dias Úteis", sabados: "Sábados", domingos: "Domingos/Feriados" } as Record<string, string>)[t] || t;

const statusBadge = (s: string) => {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "Agendado", variant: "secondary" },
    applied: { label: "Aplicado", variant: "default" },
    cancelled: { label: "Cancelado", variant: "outline" },
    failed: { label: "Falhou", variant: "destructive" },
  };
  const v = map[s] || { label: s, variant: "outline" as const };
  return <Badge variant={v.variant}>{v.label}</Badge>;
};

const tomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

const sortByHora = (a: DraftItem, b: DraftItem) => a.hora.localeCompare(b.hora);

export const ScheduledChangesCard = ({ busLines }: Props) => {
  const { items, create, update, cancel, remove, applyNow, applyAllDue } = useScheduledChanges();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [lineId, setLineId] = useState<string>("");
  const [dayType, setDayType] = useState<DayType>("uteis");
  const [direction, setDirection] = useState<string>("");
  const [date, setDate] = useState<string>(tomorrowISO());
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [draftLoadedFor, setDraftLoadedFor] = useState<string>(""); // key to avoid refetch

  const selectedLine = useMemo(() => busLines.find((l) => String(l.id) === lineId) || null, [busLines, lineId]);

  const reset = () => {
    setEditingId(null);
    setLineId("");
    setDayType("uteis");
    setDirection("");
    setDate(tomorrowISO());
    setDraftItems([]);
    setDraftLoadedFor("");
  };

  // Auto-load current schedules when creating new + all 4 fields chosen
  useEffect(() => {
    if (!open || editingId) return;
    if (!selectedLine || !direction || !dayType) return;
    const key = `${selectedLine.id}|${dayType}|${direction}`;
    if (key === draftLoadedFor) return;
    setLoadingDraft(true);
    supabase
      .from("bus_schedules")
      .select("hora,obs")
      .eq("bus_line_id", selectedLine.id)
      .eq("day_type", dayType)
      .eq("direction", direction)
      .order("hora", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          toast({ title: "Erro ao carregar horários atuais", description: error.message, variant: "destructive" });
          setDraftItems([]);
        } else {
          setDraftItems((data || []).map((r: any) => ({ hora: r.hora || "", obs: r.obs || "" })));
        }
        setDraftLoadedFor(key);
        setLoadingDraft(false);
      });
  }, [open, editingId, selectedLine, dayType, direction, draftLoadedFor, toast]);

  const openNew = () => {
    reset();
    setOpen(true);
  };

  const openEdit = (it: ScheduledChange) => {
    setEditingId(it.id);
    setLineId(String(it.bus_line_id));
    setDayType(it.day_type);
    setDirection(it.direction || "");
    setDate(it.effective_date);
    const payloadItems: DraftItem[] = Array.isArray(it.payload?.items)
      ? it.payload.items.map((x: any) => ({ hora: x.hora || "", obs: x.obs || "" }))
      : [];
    setDraftItems(payloadItems);
    setDraftLoadedFor(`${it.bus_line_id}|${it.day_type}|${it.direction}`);
    setOpen(true);
  };

  const updateItem = (idx: number, patch: Partial<DraftItem>) => {
    setDraftItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };
  const removeItem = (idx: number) => setDraftItems((prev) => prev.filter((_, i) => i !== idx));
  const addItem = () => setDraftItems((prev) => [...prev, { hora: "", obs: "" }]);

  const handleSave = async () => {
    if (!selectedLine || !direction) {
      toast({ title: "Preencha linha e ponto de partida", variant: "destructive" });
      return;
    }
    const cleaned = draftItems
      .map((d) => ({ hora: d.hora.trim(), obs: d.obs.trim() }))
      .filter((d) => d.hora);
    if (cleaned.length === 0) {
      toast({ title: "Adicione pelo menos um horário", variant: "destructive" });
      return;
    }
    const horaRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    const bad = cleaned.find((d) => !horaRegex.test(d.hora));
    if (bad) {
      toast({ title: "Hora inválida", description: `Formato esperado HH:MM (encontrado "${bad.hora}")`, variant: "destructive" });
      return;
    }
    if (date < tomorrowISO()) {
      toast({ title: "Data inválida", description: "A vigência deve ser a partir de amanhã.", variant: "destructive" });
      return;
    }
    const sorted = [...cleaned].sort(sortByHora);
    const payload = { items: sorted.map((d) => ({ hora: d.hora, obs: d.obs, direction })) };

    let ok = false;
    if (editingId) {
      ok = await update(editingId, {
        effective_date: date,
        day_type: dayType,
        direction,
        payload,
      });
    } else {
      ok = await create({
        bus_line_id: selectedLine.id,
        day_type: dayType,
        direction,
        effective_date: date,
        operation: "replace_all",
        payload,
      });
    }
    if (ok) {
      setOpen(false);
      reset();
    }
  };

  const lineLabel = (id: number) => {
    const l = busLines.find((x) => x.id === id);
    return l ? `Linha ${l.numero} – ${l.nome}` : `#${id}`;
  };

  const pending = items.filter((i) => i.status === "pending");
  const others = items.filter((i) => i.status !== "pending");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarClock className="w-5 h-5" />
          Alterações Agendadas
        </CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={applyAllDue}>
            <Play className="w-4 h-4 mr-1" />
            Aplicar vencidas
          </Button>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openNew}>
                <Plus className="w-4 h-4 mr-1" />
                Nova
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar agendamento" : "Agendar substituição de horários"}
                </DialogTitle>
                <DialogDescription>
                  Edite os horários abaixo. Na data de vigência, esta lista substituirá todos os horários atuais da linha, tipo de dia e ponto de partida selecionados.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Linha</Label>
                    <Select
                      value={lineId}
                      onValueChange={(v) => { setLineId(v); setDirection(""); setDraftLoadedFor(""); }}
                      disabled={!!editingId}
                    >
                      <SelectTrigger><SelectValue placeholder="Selecione a linha" /></SelectTrigger>
                      <SelectContent>
                        {busLines.map((l) => (
                          <SelectItem key={l.id} value={String(l.id)}>
                            {l.numero} – {l.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Data de vigência</Label>
                    <Input type="date" value={date} min={tomorrowISO()} onChange={(e) => setDate(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Dia</Label>
                    <Select
                      value={dayType}
                      onValueChange={(v) => { setDayType(v as DayType); setDraftLoadedFor(""); }}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uteis">Dias Úteis</SelectItem>
                        <SelectItem value="sabados">Sábados</SelectItem>
                        <SelectItem value="domingos">Domingos/Feriados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ponto de Partida</Label>
                    <Select
                      value={direction}
                      onValueChange={(v) => { setDirection(v); setDraftLoadedFor(""); }}
                      disabled={!selectedLine}
                    >
                      <SelectTrigger><SelectValue placeholder="Selecione o ponto" /></SelectTrigger>
                      <SelectContent>
                        {selectedLine?.directions.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Horários</Label>
                    <Button size="sm" variant="outline" onClick={addItem} disabled={!selectedLine || !direction}>
                      <Plus className="w-4 h-4 mr-1" /> Adicionar horário
                    </Button>
                  </div>

                  {!selectedLine || !direction ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      Selecione a linha, tipo de dia e ponto de partida para carregar os horários.
                    </p>
                  ) : loadingDraft ? (
                    <div className="flex items-center justify-center py-6 text-muted-foreground">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Carregando horários…
                    </div>
                  ) : draftItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      Nenhum horário. Clique em "Adicionar horário" para começar.
                    </p>
                  ) : (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[120px]">Hora</TableHead>
                            <TableHead>Via / Observação</TableHead>
                            <TableHead className="w-[60px]" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {draftItems.map((it, idx) => (
                            <TableRow key={idx}>
                              <TableCell>
                                <Input
                                  type="time"
                                  value={it.hora}
                                  onChange={(e) => updateItem(idx, { hora: e.target.value })}
                                  className="font-mono"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={it.obs}
                                  onChange={(e) => updateItem(idx, { obs: e.target.value })}
                                  placeholder="opcional"
                                />
                              </TableCell>
                              <TableCell>
                                <Button size="icon" variant="ghost" onClick={() => removeItem(idx)}>
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleSave} disabled={!selectedLine || !direction || draftItems.length === 0}>
                  {editingId ? "Salvar alterações" : "Salvar agendamento"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhuma alteração agendada.
          </p>
        ) : (
          <div className="space-y-2">
            {[...pending, ...others].map((it) => (
              <div key={it.id} className="border border-border rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {statusBadge(it.status)}
                    <span className="font-medium">{lineLabel(it.bus_line_id)}</span>
                    <Badge variant="secondary">{dayLabel(it.day_type)}</Badge>
                    {it.direction && <Badge variant="outline">{it.direction}</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Vigência: <span className="font-mono">{it.effective_date}</span>
                    {" · "}{(it.payload?.items?.length ?? 0)} horário(s)
                    {it.applied_at && ` · aplicado em ${new Date(it.applied_at).toLocaleString("pt-BR")}`}
                  </div>
                  {it.error && <p className="text-xs text-destructive">Erro: {it.error}</p>}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {it.status === "pending" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => openEdit(it)}>
                        <Pencil className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => applyNow(it.id)}>
                        <Play className="w-3 h-3 mr-1" />
                        Aplicar agora
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => cancel(it.id)}>
                        <X className="w-3 h-3 mr-1" />
                        Cancelar
                      </Button>
                    </>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir agendamento?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação remove o registro do histórico e não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove(it.id)}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
