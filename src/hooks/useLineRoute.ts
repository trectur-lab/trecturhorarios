import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const memCache = new Map<string, [number, number][]>();

export function useLineRoute(numeroLinha: string | null) {
  const [shape, setShape] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!numeroLinha) {
      setShape([]);
      return;
    }
    const cached = memCache.get(numeroLinha);
    if (cached) {
      setShape(cached);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase.functions
      .invoke("sonda-line-route", { body: { numeroLinha } })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) throw error;
        const s: [number, number][] = data?.shape ?? [];
        memCache.set(numeroLinha, s);
        setShape(s);
        setError(null);
      })
      .catch((e) => !cancelled && setError(e?.message ?? "Erro ao carregar rota"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [numeroLinha]);

  return { shape, loading, error };
}