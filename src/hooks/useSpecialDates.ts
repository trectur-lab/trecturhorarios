import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type SpecialDayType = "uteis" | "sabados" | "domingos" | "no_service";

export interface SpecialDateOverride {
  bus_line_id: number;
  day_type: SpecialDayType;
}

export interface SpecialDate {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  overrides: SpecialDateOverride[];
  created_at: string;
}

export const useSpecialDates = () => {
  const [items, setItems] = useState<SpecialDate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data: dates, error } = await supabase
      .from("special_dates")
      .select("id, date, description, created_at")
      .order("date", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar datas especiais", description: error.message, variant: "destructive" });
      setItems([]);
      setLoading(false);
      return;
    }
    const ids = (dates || []).map((d) => d.id);
    let overridesByDate: Record<string, SpecialDateOverride[]> = {};
    if (ids.length > 0) {
      const { data: ovs, error: ovErr } = await supabase
        .from("special_date_line_overrides")
        .select("special_date_id, bus_line_id, day_type")
        .in("special_date_id", ids);
      if (ovErr) {
        toast({ title: "Erro ao carregar overrides", description: ovErr.message, variant: "destructive" });
      } else {
        for (const o of ovs || []) {
          const arr = (overridesByDate[o.special_date_id] = overridesByDate[o.special_date_id] || []);
          arr.push({ bus_line_id: o.bus_line_id, day_type: o.day_type as SpecialDayType });
        }
      }
    }
    setItems(
      (dates || []).map((d) => ({
        id: d.id,
        date: d.date,
        description: d.description || "",
        created_at: d.created_at,
        overrides: overridesByDate[d.id] || [],
      })),
    );
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const create = async (input: {
    date: string;
    description: string;
    overrides: SpecialDateOverride[];
  }): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("special_dates")
      .insert({ date: input.date, description: input.description, created_by: user?.id ?? null })
      .select("id")
      .single();
    if (error || !data) {
      toast({ title: "Erro ao criar data especial", description: error?.message, variant: "destructive" });
      return false;
    }
    if (input.overrides.length > 0) {
      const rows = input.overrides.map((o) => ({
        special_date_id: data.id,
        bus_line_id: o.bus_line_id,
        day_type: o.day_type,
      }));
      const { error: ovErr } = await supabase.from("special_date_line_overrides").insert(rows);
      if (ovErr) {
        toast({ title: "Erro ao salvar overrides", description: ovErr.message, variant: "destructive" });
        return false;
      }
    }
    toast({ title: "Data especial criada" });
    await fetchAll();
    return true;
  };

  const update = async (
    id: string,
    patch: { date?: string; description?: string; overrides?: SpecialDateOverride[] },
  ): Promise<boolean> => {
    if (patch.date !== undefined || patch.description !== undefined) {
      const upd: Record<string, unknown> = {};
      if (patch.date !== undefined) upd.date = patch.date;
      if (patch.description !== undefined) upd.description = patch.description;
      const { error } = await supabase.from("special_dates").update(upd).eq("id", id);
      if (error) {
        toast({ title: "Erro ao atualizar data", description: error.message, variant: "destructive" });
        return false;
      }
    }
    if (patch.overrides) {
      const { error: delErr } = await supabase
        .from("special_date_line_overrides")
        .delete()
        .eq("special_date_id", id);
      if (delErr) {
        toast({ title: "Erro ao limpar overrides", description: delErr.message, variant: "destructive" });
        return false;
      }
      if (patch.overrides.length > 0) {
        const rows = patch.overrides.map((o) => ({
          special_date_id: id,
          bus_line_id: o.bus_line_id,
          day_type: o.day_type,
        }));
        const { error: insErr } = await supabase.from("special_date_line_overrides").insert(rows);
        if (insErr) {
          toast({ title: "Erro ao salvar overrides", description: insErr.message, variant: "destructive" });
          return false;
        }
      }
    }
    toast({ title: "Data especial atualizada" });
    await fetchAll();
    return true;
  };

  const remove = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("special_dates").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Data especial excluída" });
    await fetchAll();
    return true;
  };

  return { items, loading, create, update, remove, refresh: fetchAll };
};
