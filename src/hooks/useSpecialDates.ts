import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type OverrideKind = "uteis" | "sabados" | "domingos" | "no_service";

export interface SpecialDate {
  id: string;
  date: string;
  description: string | null;
  default_override: OverrideKind | null;
  created_at: string;
}

export interface SpecialDateLineOverride {
  id: string;
  special_date_id: string;
  bus_line_id: number;
  override: OverrideKind;
}

export const useSpecialDates = () => {
  const [dates, setDates] = useState<SpecialDate[]>([]);
  const [overrides, setOverrides] = useState<SpecialDateLineOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: d, error: dErr }, { data: o, error: oErr }] = await Promise.all([
      supabase
        .from("special_dates")
        .select("id, date, description, default_override, created_at")
        .order("date", { ascending: false }),
      supabase
        .from("special_date_line_overrides")
        .select("id, special_date_id, bus_line_id, override"),
    ]);
    if (dErr) toast({ title: "Erro ao carregar datas", description: dErr.message, variant: "destructive" });
    if (oErr) toast({ title: "Erro ao carregar exceções", description: oErr.message, variant: "destructive" });
    setDates((d || []) as SpecialDate[]);
    setOverrides((o || []) as SpecialDateLineOverride[]);
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createDate = async (input: { date: string; description: string | null; default_override: OverrideKind }) => {
    const { error } = await supabase.from("special_dates").insert(input);
    if (error) {
      toast({ title: "Erro ao criar data", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Data especial criada" });
    await fetchAll();
    return true;
  };

  const deleteDate = async (id: string) => {
    const { error } = await supabase.from("special_dates").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return false;
    }
    await fetchAll();
    return true;
  };

  const upsertOverride = async (input: { special_date_id: string; bus_line_id: number; override: OverrideKind }) => {
    const { error } = await supabase
      .from("special_date_line_overrides")
      .upsert(input, { onConflict: "special_date_id,bus_line_id" });
    if (error) {
      toast({ title: "Erro ao salvar exceção", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Exceção salva" });
    await fetchAll();
    return true;
  };

  const removeOverride = async (id: string) => {
    const { error } = await supabase.from("special_date_line_overrides").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao remover exceção", description: error.message, variant: "destructive" });
      return false;
    }
    await fetchAll();
    return true;
  };

  return { dates, overrides, loading, createDate, deleteDate, upsertOverride, removeOverride, refresh: fetchAll };
};
