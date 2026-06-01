import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ScheduledChange {
  id: string;
  bus_line_id: number;
  change_type: "edit" | "replace_all";
  day_type: "uteis" | "sabados" | "domingos" | null;
  direction: string | null;
  target_hora: string | null;
  new_hora: string | null;
  new_obs: string | null;
  payload: any;
  scheduled_for: string;
  applied_at: string | null;
}

export function useScheduledChanges() {
  const [items, setItems] = useState<ScheduledChange[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("scheduled_schedule_changes")
      .select("*")
      .order("scheduled_for", { ascending: true });
    if (error) toast.error(error.message);
    setItems((data ?? []) as ScheduledChange[]);
    setLoading(false);
  }, []);

  const create = async (change: Omit<ScheduledChange, "id" | "applied_at">) => {
    const { error } = await supabase.from("scheduled_schedule_changes").insert(change);
    if (error) {
      toast.error(error.message);
      return false;
    }
    toast.success("Mudança agendada");
    await fetchAll();
    return true;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("scheduled_schedule_changes").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Agendamento removido");
    await fetchAll();
  };

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { items, loading, create, remove, refresh: fetchAll };
}