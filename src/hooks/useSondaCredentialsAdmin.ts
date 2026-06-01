import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SondaCredsView {
  id: string;
  username: string;
  base_url: string;
  login_path: string | null;
  vehicle_position_path: string | null;
  line_route_path: string | null;
  updated_at: string;
}

export interface SondaCredsUpsert {
  username: string;
  password: string;
  base_url: string;
  login_path?: string;
  vehicle_position_path?: string;
  line_route_path?: string;
}

export function useSondaCredentialsAdmin() {
  const [creds, setCreds] = useState<SondaCredsView | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCreds = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("sonda-credentials", {
        method: "GET",
      });
      if (error) throw error;
      setCreds(data?.credentials ?? null);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao carregar credenciais");
    } finally {
      setLoading(false);
    }
  }, []);

  const save = async (input: SondaCredsUpsert) => {
    setSaving(true);
    try {
      const { error } = await supabase.functions.invoke("sonda-credentials", {
        method: "POST",
        body: input,
      });
      if (error) throw error;
      toast.success("Credenciais SONDA salvas");
      await fetchCreds();
      return true;
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar credenciais");
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchCreds();
  }, [fetchCreds]);

  return { creds, loading, saving, save, refresh: fetchCreds };
}