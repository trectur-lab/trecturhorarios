import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BusLine {
  id: number;
  numero: string;
  nome: string;
  via: string | null;
  cor: string;
  directions: string[];
  sonda_codigo_veiculo?: string | null;
  sonda_id_linha?: string | null;
}

export interface BusSchedule {
  id: string;
  bus_line_id: number;
  day_type: "uteis" | "sabados" | "domingos";
  direction: string;
  hora: string;
  obs: string | null;
}

export const useBusLinesAdmin = () => {
  const [busLines, setBusLines] = useState<BusLine[]>([]);
  const [schedules, setSchedules] = useState<BusSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBusLines = async () => {
    const { data, error } = await supabase
      .from("bus_lines")
      .select("*")
      .order("numero");

    if (error) {
      toast({
        title: "Erro ao carregar linhas",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setBusLines(data || []);
  };

  const fetchSchedules = async (busLineId?: number) => {
    let query = supabase.from("bus_schedules").select("*");
    
    if (busLineId) {
      query = query.eq("bus_line_id", busLineId);
    }

    const { data, error } = await query.order("hora");

    if (error) {
      toast({
        title: "Erro ao carregar horários",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setSchedules((data || []) as BusSchedule[]);
  };

  const createBusLine = async (line: Omit<BusLine, "id">) => {
    const { data, error } = await supabase
      .from("bus_lines")
      .insert(line)
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao criar linha",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "Linha criada!",
      description: `Linha ${line.numero} foi criada com sucesso.`,
    });

    await fetchBusLines();
    return data;
  };

  const updateBusLine = async (id: number, updates: Partial<BusLine>) => {
    const { error } = await supabase
      .from("bus_lines")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro ao atualizar linha",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Linha atualizada!",
      description: "As alterações foram salvas.",
    });

    await fetchBusLines();
    return true;
  };

  const deleteBusLine = async (id: number) => {
    const { error } = await supabase.from("bus_lines").delete().eq("id", id);

    if (error) {
      toast({
        title: "Erro ao excluir linha",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Linha excluída!",
      description: "A linha foi removida com sucesso.",
    });

    await fetchBusLines();
    return true;
  };

  const createSchedule = async (schedule: Omit<BusSchedule, "id">) => {
    const { data, error } = await supabase
      .from("bus_schedules")
      .insert(schedule)
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao criar horário",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "Horário criado!",
      description: `Horário ${schedule.hora} foi adicionado.`,
    });

    await fetchSchedules(schedule.bus_line_id);
    return data;
  };

  const updateSchedule = async (id: string, updates: Partial<BusSchedule>) => {
    const { data, error } = await supabase
      .from("bus_schedules")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) {
      toast({
        title: "Erro ao atualizar horário",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    if (!data || data.length === 0) {
      toast({
        title: "Não foi possível salvar",
        description:
          "Nenhuma alteração foi gravada. Sua sessão de admin pode ter expirado — faça login novamente.",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Horário atualizado!",
      description: "As alterações foram salvas.",
    });

    return true;
  };

  const deleteSchedule = async (id: string, busLineId: number) => {
    const { error } = await supabase.from("bus_schedules").delete().eq("id", id);

    if (error) {
      toast({
        title: "Erro ao excluir horário",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Horário excluído!",
      description: "O horário foi removido.",
    });

    await fetchSchedules(busLineId);
    return true;
  };

  const bulkCreateSchedules = async (schedules: Omit<BusSchedule, "id">[]) => {
    const { error } = await supabase.from("bus_schedules").insert(schedules);

    if (error) {
      toast({
        title: "Erro ao importar horários",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Horários importados!",
      description: `${schedules.length} horários foram adicionados.`,
    });

    return true;
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchBusLines();
      setLoading(false);
    };
    init();
  }, []);

  return {
    busLines,
    schedules,
    loading,
    fetchBusLines,
    fetchSchedules,
    createBusLine,
    updateBusLine,
    deleteBusLine,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    bulkCreateSchedules,
  };
};
