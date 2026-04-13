import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useBusLinesAdmin, BusLine, BusSchedule } from "@/hooks/useBusLinesAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bus,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Clock,
  Search,
  Loader2,
  ArrowLeft,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";

const Admin = () => {
  const { isAdmin, userEmail, signOut } = useAuth();
  const {
    busLines,
    schedules,
    loading,
    fetchSchedules,
    createBusLine,
    updateBusLine,
    deleteBusLine,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  } = useBusLinesAdmin();

  const [selectedLine, setSelectedLine] = useState<BusLine | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dayTypeFilter, setDayTypeFilter] = useState<string>("all");
  const [directionFilter, setDirectionFilter] = useState<string>("all");

  // Form states
  const [lineForm, setLineForm] = useState({
    numero: "",
    nome: "",
    via: "",
    cor: "#3498db",
    directions: "",
  });
  const [scheduleForm, setScheduleForm] = useState({
    hora: "",
    obs: "",
    day_type: "uteis" as "uteis" | "sabados" | "domingos",
    direction: "",
  });
  const [editingLine, setEditingLine] = useState<BusLine | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<BusSchedule | null>(null);
  const [isLineDialogOpen, setIsLineDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  const handleSelectLine = async (line: BusLine) => {
    setSelectedLine(line);
    await fetchSchedules(line.id);
    setDirectionFilter("all");
    setDayTypeFilter("all");
  };

  const handleCreateLine = async () => {
    const directions = lineForm.directions
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    await createBusLine({
      numero: lineForm.numero,
      nome: lineForm.nome,
      via: lineForm.via || null,
      cor: lineForm.cor,
      directions,
    });

    setLineForm({ numero: "", nome: "", via: "", cor: "#3498db", directions: "" });
    setIsLineDialogOpen(false);
  };

  const handleUpdateLine = async () => {
    if (!editingLine) return;

    const directions = lineForm.directions
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    await updateBusLine(editingLine.id, {
      numero: lineForm.numero,
      nome: lineForm.nome,
      via: lineForm.via || null,
      cor: lineForm.cor,
      directions,
    });

    setEditingLine(null);
    setLineForm({ numero: "", nome: "", via: "", cor: "#3498db", directions: "" });
    setIsLineDialogOpen(false);
  };

  const handleDeleteLine = async (id: number) => {
    await deleteBusLine(id);
    if (selectedLine?.id === id) {
      setSelectedLine(null);
    }
  };

  const handleCreateSchedule = async () => {
    if (!selectedLine) return;

    await createSchedule({
      bus_line_id: selectedLine.id,
      day_type: scheduleForm.day_type,
      direction: scheduleForm.direction,
      hora: scheduleForm.hora,
      obs: scheduleForm.obs || "",
    });

    setScheduleForm({ hora: "", obs: "", day_type: "uteis", direction: "" });
    setIsScheduleDialogOpen(false);
    await fetchSchedules(selectedLine.id);
  };

  const handleUpdateSchedule = async () => {
    if (!editingSchedule || !selectedLine) return;

    // Build partial update — only include fields that changed
    const updates: Partial<BusSchedule> = {};
    if (scheduleForm.hora !== editingSchedule.hora) updates.hora = scheduleForm.hora;
    if (scheduleForm.day_type !== editingSchedule.day_type) updates.day_type = scheduleForm.day_type;
    if (scheduleForm.direction !== editingSchedule.direction) updates.direction = scheduleForm.direction;
    // Always send obs to allow clearing it (empty string is valid)
    updates.obs = scheduleForm.obs || null;

    await updateSchedule(editingSchedule.id, updates);

    setEditingSchedule(null);
    setScheduleForm({ hora: "", obs: "", day_type: "uteis", direction: "" });
    setIsScheduleDialogOpen(false);
    await fetchSchedules(selectedLine.id);
  };

  const handleDeleteSchedule = async (schedule: BusSchedule) => {
    await deleteSchedule(schedule.id, schedule.bus_line_id);
  };

  const openEditLineDialog = (line: BusLine) => {
    setEditingLine(line);
    setLineForm({
      numero: line.numero,
      nome: line.nome,
      via: line.via || "",
      cor: line.cor,
      directions: line.directions.join(", "),
    });
    setIsLineDialogOpen(true);
  };

  const openEditScheduleDialog = (schedule: BusSchedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      hora: schedule.hora,
      obs: schedule.obs ?? "",
      day_type: schedule.day_type,
      direction: schedule.direction,
    });
    setIsScheduleDialogOpen(true);
  };

  const filteredSchedules = schedules.filter((s) => {
    const matchesSearch =
      s.hora.includes(searchTerm) || (s.obs || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDayType = dayTypeFilter === "all" || s.day_type === dayTypeFilter;
    const matchesDirection = directionFilter === "all" || s.direction === directionFilter;
    return matchesSearch && matchesDayType && matchesDirection;
  });

  const getDayTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      uteis: "Dias Úteis",
      sabados: "Sábados",
      domingos: "Domingos/Feriados",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
            <div className="flex items-center gap-2">
              <Bus className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Painel de Controle</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin/import">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Atualizar APP
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground">{userEmail}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lista de Linhas */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Linhas de Ônibus</CardTitle>
              <Dialog open={isLineDialogOpen} onOpenChange={setIsLineDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingLine(null);
                      setLineForm({ numero: "", nome: "", via: "", cor: "#3498db", directions: "" });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Nova
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingLine ? "Editar Linha" : "Nova Linha"}</DialogTitle>
                    <DialogDescription>
                      Preencha os dados da linha de ônibus
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Número</Label>
                        <Input
                          value={lineForm.numero}
                          onChange={(e) => setLineForm({ ...lineForm, numero: e.target.value })}
                          placeholder="01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cor</Label>
                        <Input
                          type="color"
                          value={lineForm.cor}
                          onChange={(e) => setLineForm({ ...lineForm, cor: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input
                        value={lineForm.nome}
                        onChange={(e) => setLineForm({ ...lineForm, nome: e.target.value })}
                        placeholder="Jardim Paraíso / N.Sra. Aparecida"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Via (opcional)</Label>
                      <Input
                        value={lineForm.via}
                        onChange={(e) => setLineForm({ ...lineForm, via: e.target.value })}
                        placeholder="Via Novo Horizonte"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pontos de Partida (separados por vírgula)</Label>
                      <Input
                        value={lineForm.directions}
                        onChange={(e) => setLineForm({ ...lineForm, directions: e.target.value })}
                        placeholder="Jardim Paraíso, Jardim Europa II"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={editingLine ? handleUpdateLine : handleCreateLine}
                    >
                      {editingLine ? "Salvar" : "Criar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[60vh] overflow-auto">
                {busLines.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    Nenhuma linha cadastrada.
                    <br />
                    Clique em "Nova" para adicionar.
                  </div>
                ) : (
                  busLines.map((line) => (
                    <div
                      key={line.id}
                      className={`p-4 border-b border-border cursor-pointer transition-colors hover:bg-secondary/50 ${
                        selectedLine?.id === line.id ? "bg-secondary" : ""
                      }`}
                      onClick={() => handleSelectLine(line)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: line.cor }}
                          >
                            {line.numero}
                          </div>
                          <div>
                            <p className="font-medium">{line.nome}</p>
                            <p className="text-xs text-muted-foreground">
                              {line.directions.join(" • ")}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditLineDialog(line);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Linha?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Isso irá excluir a linha {line.numero} e todos os seus horários.
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteLine(line.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Horários da Linha Selecionada */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {selectedLine
                    ? `Horários - Linha ${selectedLine.numero}`
                    : "Selecione uma linha"}
                </CardTitle>
                {selectedLine && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingSchedule(null);
                        setScheduleForm({
                          hora: "",
                          obs: "",
                          day_type: "uteis",
                          direction: selectedLine.directions[0] || "",
                        });
                        setIsScheduleDialogOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Novo Horário
                    </Button>
                    <Dialog
                      key={editingSchedule?.id || "new"}
                      open={isScheduleDialogOpen}
                      onOpenChange={(open) => {
                        setIsScheduleDialogOpen(open);
                        if (!open) {
                          setEditingSchedule(null);
                          setScheduleForm({ hora: "", obs: "", day_type: "uteis", direction: "" });
                        }
                      }}
                    >
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {editingSchedule ? "Editar Horário" : "Novo Horário"}
                          </DialogTitle>
                          <DialogDescription>
                            Preencha os dados do horário
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Horário</Label>
                              <Input
                                value={scheduleForm.hora}
                                onChange={(e) =>
                                  setScheduleForm({ ...scheduleForm, hora: e.target.value })
                                }
                                placeholder="08:30"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Tipo de Dia</Label>
                              <Select
                                value={scheduleForm.day_type}
                                onValueChange={(v) =>
                                  setScheduleForm({
                                    ...scheduleForm,
                                    day_type: v as "uteis" | "sabados" | "domingos",
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="uteis">Dias Úteis</SelectItem>
                                  <SelectItem value="sabados">Sábados</SelectItem>
                                  <SelectItem value="domingos">Domingos/Feriados</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Ponto de Partida</Label>
                            <Select
                              value={scheduleForm.direction}
                              onValueChange={(v) =>
                                setScheduleForm({ ...scheduleForm, direction: v })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o ponto" />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedLine?.directions.map((d) => (
                                  <SelectItem key={d} value={d}>
                                    {d}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Observação VIA (opcional)</Label>
                            <Input
                              value={scheduleForm.obs}
                              onChange={(e) =>
                                setScheduleForm({ ...scheduleForm, obs: e.target.value })
                              }
                              placeholder="Via Vila Resende"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={editingSchedule ? handleUpdateSchedule : handleCreateSchedule}
                          >
                            {editingSchedule ? "Salvar" : "Criar"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </div>

              {/* Filtros */}
              {selectedLine && (
                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar horário ou via..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={dayTypeFilter} onValueChange={setDayTypeFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Tipo de dia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="uteis">Dias Úteis</SelectItem>
                      <SelectItem value="sabados">Sábados</SelectItem>
                      <SelectItem value="domingos">Domingos/Feriados</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={directionFilter} onValueChange={setDirectionFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Partida" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas partidas</SelectItem>
                      {selectedLine.directions.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!selectedLine ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione uma linha para ver e editar os horários</p>
                </div>
              ) : filteredSchedules.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum horário encontrado.</p>
                  <p className="text-sm">Clique em "Novo Horário" para adicionar.</p>
                </div>
              ) : (
                <div className="overflow-auto max-h-[60vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Horário</TableHead>
                        <TableHead>Partida</TableHead>
                        <TableHead>Tipo de Dia</TableHead>
                        <TableHead>Observação VIA</TableHead>
                        <TableHead className="w-[100px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSchedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell className="font-mono font-bold">
                            {schedule.hora}
                          </TableCell>
                          <TableCell>{schedule.direction}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {getDayTypeLabel(schedule.day_type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {schedule.obs ? (
                              <span className="text-primary text-sm">{schedule.obs}</span>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditScheduleDialog(schedule)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir Horário?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Deseja excluir o horário {schedule.hora}? Esta ação não pode ser
                                      desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteSchedule(schedule)}
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
