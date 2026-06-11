import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ScheduledChangeStatus = "pending" | "applied" | "cancelled" | "failed";
export type ScheduledChangeOperation = "edit" | "replace_all";
export type DayType = "uteis" | "sabados" | "domingos";

export interface ScheduledChange {
  id: string;
  bus_line_id: number;
  day_type: DayType;
  direction: string | null;
  effective_date: string; // YYYY-MM-DD
  operation: ScheduledChangeOperation;
  payload: any;
  status: ScheduledChangeStatus;
  applied_at: string | null;
  error: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useScheduledChanges = () => {
  const [items, setItems] = useState<ScheduledChange[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from("scheduled_schedule_changes")
      .select("*")
      .order("effective_date", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      toast({ title: "Erro ao carregar agendamentos", description: error.message, variant: "destructive" });
      return;
    }
    setItems((data || []) as ScheduledChange[]);
  }, [toast]);

  const create = async (input: {
    bus_line_id: number;
    day_type: DayType;
    direction: string | null;
    effective_date: string;
    operation: ScheduledChangeOperation;
    payload: any;
  }) => {
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("scheduled_schedule_changes").insert({
      ...input,
      scheduled_for: input.effective_date,
      created_by: userData.user?.id ?? null,
    });
    if (error) {
      toast({ title: "Erro ao agendar alteração", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Alteração agendada!", description: `Será aplicada em ${input.effective_date}.` });
    await fetchAll();
    return true;
  };

  const update = async (
    id: string,
    patch: Partial<Pick<ScheduledChange, "effective_date" | "day_type" | "direction" | "payload">>
  ) => {
    const { error } = await supabase
      .from("scheduled_schedule_changes")
      .update(patch)
      .eq("id", id);
    if (error) {
      toast({ title: "Erro ao atualizar agendamento", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Agendamento atualizado" });
    await fetchAll();
    return true;
  };

  const cancel = async (id: string) => {
    const { error } = await supabase
      .from("scheduled_schedule_changes")
      .update({ status: "cancelled" })
      .eq("id", id);
    if (error) {
      toast({ title: "Erro ao cancelar", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Agendamento cancelado" });
    await fetchAll();
    return true;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("scheduled_schedule_changes").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return false;
    }
    await fetchAll();
    return true;
  };

  const applyNow = async (id: string) => {
    const { data, error } = await supabase.rpc("apply_scheduled_change", { _id: id });
    if (error) {
      toast({ title: "Erro ao aplicar", description: error.message, variant: "destructive" });
      return false;
    }
    if (data === true) {
      toast({ title: "Alteração aplicada!" });
    } else {
      toast({ title: "Não foi possível aplicar", description: "Verifique o status do agendamento.", variant: "destructive" });
    }
    await fetchAll();
    return data === true;
  };

  const applyAllDue = async () => {
    const { data, error } = await supabase.rpc("apply_due_scheduled_changes");
    if (error) {
      toast({ title: "Erro ao aplicar pendentes", description: error.message, variant: "destructive" });
      return 0;
    }
    toast({ title: `Aplicação concluída`, description: `${data ?? 0} agendamento(s) processado(s).` });
    await fetchAll();
    return (data as number) ?? 0;
  };

  useEffect(() => {
    setLoading(true);
    fetchAll().finally(() => setLoading(false));
  }, [fetchAll]);

  return { items, loading, fetchAll, create, update, cancel, remove, applyNow, applyAllDue };
};
