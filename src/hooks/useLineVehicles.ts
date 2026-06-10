import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface VehiclePosition {
  codigo: string;
  placa: string | null;
  linha: string | null;
  lat: number;
  lng: number;
  velocidade: number;
  sentido: string | null;
  trajeto: string | null;
  dataHora: number | string | null;
  /** Bearing em graus (0=N, 90=L), calculado a partir da posição anterior. */
  bearing: number | null;
  /** Estado de movimento, derivado do histórico de posições. */
  status: "moving" | "idle" | "stopped";
  /** Segundos desde o último deslocamento detectado (>5m). */
  stoppedForSec: number;
}

interface UseLineVehiclesResult {
  vehicles: VehiclePosition[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

const POLL_INTERVAL_MS = 30_000;

const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

function computeBearing(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δλ = toRad(b.lng - a.lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371000;
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const dφ = toRad(b.lat - a.lat);
  const dλ = toRad(b.lng - a.lng);
  const h =
    Math.sin(dφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function useLineVehicles(
  numeroLinha: string | null | undefined,
): UseLineVehiclesResult {
  const [vehicles, setVehicles] = useState<VehiclePosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [tick, setTick] = useState(0);
  const cancelRef = useRef(false);
  const prevPosRef = useRef<Map<string, { lat: number; lng: number }>>(new Map());
  const lastBearingRef = useRef<Map<string, number>>(new Map());
  const lastMovedAtRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!numeroLinha) {
      setVehicles([]);
      setError(null);
      setLastUpdated(null);
      prevPosRef.current.clear();
      lastBearingRef.current.clear();
      lastMovedAtRef.current.clear();
      return;
    }
    cancelRef.current = false;

    const run = async () => {
      setLoading(true);
      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          "sonda-vehicle-position",
          { body: { numeroLinha } },
        );
        if (cancelRef.current) return;

        if (fnError) {
          setError(fnError.message ?? "Erro ao buscar posições");
          return;
        }
        if (data?.error) {
          if (data.error === "credentials_not_configured") {
            setError("Credenciais SONDA não configuradas.");
          } else if (data.error === "auth_failed") {
            setError("Falha ao autenticar na SONDA. Verifique as credenciais.");
          } else {
            setError("Erro ao buscar posições dos veículos.");
          }
          setVehicles([]);
          return;
        }

        const raw = (data?.vehicles ?? []) as Omit<
          VehiclePosition,
          "bearing" | "status" | "stoppedForSec"
        >[];
        const now = Date.now();
        const enriched: VehiclePosition[] = raw.map((v) => {
          const cur = { lat: v.lat, lng: v.lng };
          const prev = prevPosRef.current.get(v.codigo);
          let bearing: number | null = lastBearingRef.current.get(v.codigo) ?? null;
          let lastMovedAt = lastMovedAtRef.current.get(v.codigo);
          const moved = prev ? distanceMeters(prev, cur) > 5 : false;
          if (moved) {
            bearing = computeBearing(prev!, cur);
            lastBearingRef.current.set(v.codigo, bearing);
            lastMovedAt = now;
            lastMovedAtRef.current.set(v.codigo, now);
          } else if (lastMovedAt == null) {
            // Primeira aparição: assume "movendo" para evitar falso parado.
            lastMovedAt = now;
            lastMovedAtRef.current.set(v.codigo, now);
          }
          prevPosRef.current.set(v.codigo, cur);

          const elapsed = now - (lastMovedAt ?? now);
          const stoppedForSec = Math.floor(elapsed / 1000);
          let status: VehiclePosition["status"];
          if (elapsed < 35_000) status = "moving";
          else if (elapsed <= 60_000) status = "idle";
          else status = "stopped";

          return { ...v, bearing, status, stoppedForSec };
        });

        setVehicles(enriched);
        setLastUpdated(new Date());
        setError(null);
      } catch (e: any) {
        if (!cancelRef.current) setError(e?.message ?? "Erro inesperado");
      } finally {
        if (!cancelRef.current) setLoading(false);
      }
    };

    run();
    const id = window.setInterval(run, POLL_INTERVAL_MS);
    return () => {
      cancelRef.current = true;
      window.clearInterval(id);
    };
  }, [numeroLinha, tick]);

  return {
    vehicles,
    loading,
    error,
    lastUpdated,
    refresh: () => setTick((t) => t + 1),
  };
}
