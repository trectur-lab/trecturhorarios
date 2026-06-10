import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface VehiclePosition {
  codigo: string;
  lat: number;
  lng: number;
  velocidade: number;
  sentido: string | null;
  timestamp: string;
}

interface UseVehiclePositionResult {
  position: VehiclePosition | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

const POLL_INTERVAL_MS = 30_000;

export function useVehiclePosition(
  codigoVeiculo: string | null | undefined,
): UseVehiclePositionResult {
  const [position, setPosition] = useState<VehiclePosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const tickRef = useRef<number>(0);

  useEffect(() => {
    if (!codigoVeiculo) {
      setPosition(null);
      setError(null);
      setLastUpdated(null);
      return;
    }

    let cancelled = false;
    let intervalId: number | null = null;

    const fetchPosition = async () => {
      setLoading(true);
      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          "sonda-vehicle-position",
          { body: { codigoVeiculo } },
        );
        if (cancelled) return;

        if (fnError) {
          setError(fnError.message ?? "Erro ao buscar posição");
          return;
        }
        if (data?.error) {
          if (data.error === "credentials_not_configured") {
            setError("Credenciais SONDA não configuradas.");
          } else if (data.error === "vehicle_not_found") {
            setError("Veículo não encontrado na API SONDA.");
          } else if (data.error === "auth_failed") {
            setError("Falha ao autenticar na SONDA. Verifique as credenciais.");
          } else {
            setError("Erro ao buscar posição do veículo.");
          }
          setPosition(null);
          return;
        }
        if (data?.data) {
          setPosition(data.data as VehiclePosition);
          setLastUpdated(new Date());
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Erro inesperado");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPosition();
    intervalId = window.setInterval(fetchPosition, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [codigoVeiculo, tickRef.current]);

  const refresh = () => {
    tickRef.current += 1;
  };

  return { position, loading, error, lastUpdated, refresh };
}
