import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type OverrideKind = "uteis" | "sabados" | "domingos" | "no_service";

export interface SpecialDate {
  id: string;
  date: string;
  description: string | null;
  default_override: OverrideKind | null;
}

export interface SpecialDateLineOverride {
  id: string;
  special_date_id: string;
  bus_line_id: number;
  override: OverrideKind;
}

export function useSpecialDates() {
  const [dates, setDates] = useState<SpecialDate[]>([]);
  const [overrides, setOverrides] = useState<SpecialDateLineOverride[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [d, o] = await Promise.all([
      supabase.from("special_dates").select("*").order("date"),
      supabase.from("special_date_line_overrides").select("*"),
    ]);
    if (d.error) toast.error(d.error.message);
    if (o.error) toast.error(o.error.message);
    setDates((d.data ?? []) as SpecialDate[]);
    setOverrides((o.data ?? []) as SpecialDateLineOverride[]);
    setLoading(false);
  }, []);

  const createDate = async (input: Omit<SpecialDate, "id">) => {
    const { error } = await supabase.from("special_dates").insert(input);
    if (error) return toast.error(error.message);
    toast.success("Data especial criada");
    await fetchAll();
  };

  const deleteDate = async (id: string) => {
    const { error } = await supabase.from("special_dates").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await fetchAll();
  };

  const upsertOverride = async (input: Omit<SpecialDateLineOverride, "id">) => {
    const { error } = await supabase
      .from("special_date_line_overrides")
      .upsert(input, { onConflict: "special_date_id,bus_line_id" });
    if (error) return toast.error(error.message);
    toast.success("Exceção registrada");
    await fetchAll();
  };

  const removeOverride = async (id: string) => {
    const { error } = await supabase.from("special_date_line_overrides").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await fetchAll();
  };

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { dates, overrides, loading, createDate, deleteDate, upsertOverride, removeOverride, refresh: fetchAll };
}