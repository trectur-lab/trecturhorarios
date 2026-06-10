import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const DEFAULT_AUTH_URL =
  "https://consultaviagem.m2mfrota.com.br/AutenticarUsuario";
export const DEFAULT_DATA_URL =
  "https://zn5.sinopticoplus.com/servico-dados/api/v1/obterPosicaoVeiculo";

export interface SondaCredentials {
  id: string;
  auth_url: string;
  data_url: string;
  usuario: string;
  senha: string;
  is_active: boolean;
  updated_at: string;
}

export function useSondaCredentialsAdmin() {
  const [credentials, setCredentials] = useState<SondaCredentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const fetch = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sonda_credentials")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      toast({
        title: "Erro ao carregar credenciais SONDA",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    setCredentials(data as SondaCredentials | null);
    setLoading(false);
  };

  const save = async (values: {
    auth_url: string;
    data_url: string;
    usuario: string;
    senha: string;
  }) => {
    setSaving(true);
    let error;
    if (credentials) {
      ({ error } = await supabase
        .from("sonda_credentials")
        .update({ ...values, is_active: true })
        .eq("id", credentials.id));
    } else {
      ({ error } = await supabase
        .from("sonda_credentials")
        .insert({ ...values, is_active: true }));
    }
    setSaving(false);

    if (error) {
      toast({
        title: "Erro ao salvar credenciais",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
    toast({ title: "Credenciais SONDA salvas com sucesso." });
    await fetch();
    return true;
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "sonda-vehicle-position",
        { body: { ping: true } },
      );
      if (error) {
        toast({
          title: "Falha no teste",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      if (data?.error) {
        toast({
          title: "Falha no teste",
          description: data.error,
          variant: "destructive",
        });
        return false;
      }
      toast({
        title: "Conexão OK",
        description: data?.message ?? "Login SONDA bem-sucedido.",
      });
      return true;
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return {
    credentials,
    loading,
    saving,
    testing,
    save,
    testConnection,
    refetch: fetch,
  };
}
