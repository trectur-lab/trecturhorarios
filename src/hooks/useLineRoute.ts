import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const cache = new Map<string, [number, number][]>();
const inflight = new Map<string, Promise<[number, number][]>>();

export function useLineRoute(numeroLinha: string | null | undefined) {
  const [shape, setShape] = useState<[number, number][]>(() =>
    numeroLinha ? cache.get(numeroLinha) ?? [] : [],
  );

  useEffect(() => {
    if (!numeroLinha) {
      setShape([]);
      return;
    }
    const cached = cache.get(numeroLinha);
    if (cached) {
      setShape(cached);
      return;
    }

    let cancelled = false;
    const load = async (): Promise<[number, number][]> => {
      try {
        const { data, error } = await supabase.functions.invoke(
          "sonda-line-route",
          { body: { numeroLinha } },
        );
        if (error || !data || data.error) return [];
        const s = Array.isArray(data.shape) ? (data.shape as [number, number][]) : [];
        return s;
      } catch {
        return [];
      }
    };

    let p = inflight.get(numeroLinha);
    if (!p) {
      p = load().then((s) => {
        cache.set(numeroLinha, s);
        inflight.delete(numeroLinha);
        return s;
      });
      inflight.set(numeroLinha, p);
    }

    p.then((s) => {
      if (!cancelled) setShape(s);
    });

    return () => {
      cancelled = true;
    };
  }, [numeroLinha]);

  return shape;
}
