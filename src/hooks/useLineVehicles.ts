import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SondaVehicle {
  codigo: string;
  placa: string;
  lat: number;
  lng: number;
  velocidade: number;
  dataHora: string;
  sentido: string;
  trajeto: string;
  bearing: number;
  status: "moving" | "idle" | "stopped";
  stoppedForSec: number;
}

const POLL_MS = 15_000;

export function useLineVehicles(numeroLinha: string | null, mapSentido?: string) {
  const [vehicles, setVehicles] = useState<SondaVehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const fetchOnce = useCallback(async () => {
    if (!numeroLinha) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("sonda-vehicle-position", {
        body: { numeroLinha },
      });
      if (error) throw error;
      const list: SondaVehicle[] = data?.vehicles ?? [];
      const filtered = mapSentido
        ? list.filter((v) => !v.sentido || v.sentido.toLowerCase().includes(mapSentido.toLowerCase()))
        : list;
      setVehicles(filtered);
      setLastFetch(data?.fetchedAt ?? new Date().toISOString());
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao buscar veículos");
    } finally {
      setLoading(false);
    }
  }, [numeroLinha, mapSentido]);

  useEffect(() => {
    setVehicles([]);
    if (!numeroLinha) return;
    fetchOnce();
    timerRef.current = window.setInterval(fetchOnce, POLL_MS);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [numeroLinha, fetchOnce]);

  return { vehicles, loading, error, lastFetch, refresh: fetchOnce };
}