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
import { CalendarHeart, Plus, Trash2, Pencil } from "lucide-react";
import { useSpecialDates, SpecialDayType, SpecialDate } from "@/hooks/useSpecialDates";
import { BusLine } from "@/hooks/useBusLinesAdmin";
import { useToast } from "@/hooks/use-toast";

interface Props {
  busLines: BusLine[];
}

const dayLabel: Record<SpecialDayType, string> = {
  uteis: "Dias Úteis",
  sabados: "Sábados",
  domingos: "Domingos/Feriados",
  no_service: "Não opera",
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export const SpecialDatesCard = ({ busLines }: Props) => {
  const { items, create, update, remove } = useSpecialDates();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState<string>(todayISO());
  const [description, setDescription] = useState("");
  const [overrides, setOverrides] = useState<Record<number, SpecialDayType>>({});

  const sortedLines = useMemo(
    () =>
      [...busLines].sort((a, b) =>
        a.numero.localeCompare(b.numero, "pt-BR", { numeric: true }),
      ),
    [busLines],
  );

  const reset = () => {
    setEditingId(null);
    setDate(todayISO());
    setDescription("");
    const defaults: Record<number, SpecialDayType> = {};
    for (const l of busLines) defaults[l.id] = "domingos";
    setOverrides(defaults);
  };

  useEffect(() => {
    if (open && !editingId) {
      const defaults: Record<number, SpecialDayType> = {};
      for (const l of busLines) defaults[l.id] = "domingos";
      setOverrides((prev) => (Object.keys(prev).length === 0 ? defaults : prev));
    }
  }, [open, editingId, busLines]);

  const openNew = () => {
    reset();
    const defaults: Record<number, SpecialDayType> = {};
    for (const l of busLines) defaults[l.id] = "domingos";
    setOverrides(defaults);
    setOpen(true);
  };

  const openEdit = (it: SpecialDate) => {
    setEditingId(it.id);
    setDate(it.date);
    setDescription(it.description);
    const map: Record<number, SpecialDayType> = {};
    for (const l of busLines) map[l.id] = "domingos";
    for (const o of it.overrides) map[o.bus_line_id] = o.day_type;
    setOverrides(map);
    setOpen(true);
  };

  const applyToAll = (dt: SpecialDayType) => {
    const map: Record<number, SpecialDayType> = {};
    for (const l of busLines) map[l.id] = dt;
    setOverrides(map);
  };

  const handleSave = async () => {
    if (!date) {
      toast({ title: "Informe a data", variant: "destructive" });
      return;
    }
    const ovs = sortedLines.map((l) => ({
      bus_line_id: l.id,
      day_type: overrides[l.id] || "domingos",
    }));
    const ok = editingId
      ? await update(editingId, { date, description, overrides: ovs })
      : await create({ date, description, overrides: ovs });
    if (ok) {
      setOpen(false);
      reset();
    }
  };

  const today = todayISO();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarHeart className="w-5 h-5" />
          Datas Especiais (Feriados)
        </CardTitle>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openNew}>
              <Plus className="w-4 h-4 mr-1" />
              Nova data especial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar data especial" : "Nova data especial"}
              </DialogTitle>
              <DialogDescription>
                Para cada linha, escolha qual Tipo de Dia ela rodará na data selecionada. Os horários consultados serão os já cadastrados para esse tipo de dia.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Descrição (opcional)</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex.: Feriado Municipal — Aniversário da Cidade"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <span className="text-sm text-muted-foreground mr-2">Aplicar a todas:</span>
                <Button size="sm" variant="outline" onClick={() => applyToAll("uteis")}>Dias Úteis</Button>
                <Button size="sm" variant="outline" onClick={() => applyToAll("sabados")}>Sábados</Button>
                <Button size="sm" variant="outline" onClick={() => applyToAll("domingos")}>Domingos/Feriados</Button>
                <Button size="sm" variant="outline" onClick={() => applyToAll("no_service")}>Não opera</Button>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Linha</TableHead>
                      <TableHead className="w-[260px]">Rodar como</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedLines.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.cor }} />
                            <span className="font-medium">{l.numero}</span>
                            <span className="text-muted-foreground">– {l.nome}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={overrides[l.id] || "domingos"}
                            onValueChange={(v) =>
                              setOverrides((prev) => ({ ...prev, [l.id]: v as SpecialDayType }))
                            }
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="uteis">Dias Úteis</SelectItem>
                              <SelectItem value="sabados">Sábados</SelectItem>
                              <SelectItem value="domingos">Domingos/Feriados</SelectItem>
                              <SelectItem value="no_service">Não opera</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleSave}>
                {editingId ? "Salvar alterações" : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhuma data especial cadastrada.
          </p>
        ) : (
          items.map((it) => {
            const past = it.date < today;
            const summary = it.overrides.reduce<Record<SpecialDayType, number>>(
              (acc, o) => {
                acc[o.day_type] = (acc[o.day_type] || 0) + 1;
                return acc;
              },
              { uteis: 0, sabados: 0, domingos: 0, no_service: 0 },
            );
            return (
              <div
                key={it.id}
                className={`border border-border rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 ${past ? "opacity-60" : ""}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={past ? "outline" : "default"}>
                      {new Date(it.date + "T12:00:00").toLocaleDateString("pt-BR")}
                    </Badge>
                    {it.description && <span className="font-medium">{it.description}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                    {summary.uteis > 0 && <span>{summary.uteis} como Dias Úteis</span>}
                    {summary.sabados > 0 && <span>· {summary.sabados} como Sábados</span>}
                    {summary.domingos > 0 && <span>· {summary.domingos} como Domingos/Feriados</span>}
                    {summary.no_service > 0 && <span>· {summary.no_service} não operam</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(it)}>
                    <Pencil className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir data especial?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação remove permanentemente esta data e seus overrides.
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
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
