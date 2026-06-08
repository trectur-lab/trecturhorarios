import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Maximize2, Minimize2, RefreshCw } from "lucide-react";
import { useLineVehicles } from "@/hooks/useLineVehicles";
import type { SondaVehicle } from "@/hooks/useLineVehicles";

interface LineMapProps {
  numeroLinha: string;
  nomeLinha?: string;
  cor: string;
  mapSentido?: "ida" | "volta" | null;
}

function vehicleIcon(color: string, bearing: number, label: string, moving: boolean) {
  const shape = moving
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
         style="transform: rotate(${bearing}deg); transform-origin: center;">
         <path d="M12 2 L19 20 L12 16 L5 20 Z" fill="${color}" stroke="white" stroke-width="1.2"/>
       </svg>`
    : `<div style="width:16px;height:16px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,.4)"></div>`;
  const html = `
    <div style="display:flex;align-items:center;gap:4px;transform:translateX(-50%);white-space:nowrap;">
      ${shape}
      <span style="background:white;border:1px solid rgba(0,0,0,.6);border-radius:6px;padding:1px 5px;font:600 11px/1.1 system-ui,sans-serif;color:#111;box-shadow:0 1px 2px rgba(0,0,0,.25);">${label}</span>
    </div>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: [64, 28],
    iconAnchor: [14, 14],
  });
}

const STATUS_COLOR = {
  moving: "#22c55e",
  idle: "#3b82f6",
  stopped: "#ef4444",
} as const;

function RecenterOnVehicles({ vehicles }: { vehicles: SondaVehicle[] }) {
  const map = useMap();
  const lastKeyRef = useRef<string>("");
  useEffect(() => {
    if (vehicles.length === 0) return;
    const key = vehicles.map((v) => v.codigo).sort().join(",");
    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;
    if (vehicles.length === 1) {
      map.setView([vehicles[0].lat, vehicles[0].lng], 15, { animate: true });
    } else {
      const bounds = L.latLngBounds(vehicles.map((v) => [v.lat, v.lng] as [number, number]));
      map.fitBounds(bounds.pad(0.2), { animate: true });
    }
  }, [vehicles, map]);
  return null;
}

function InvalidateOnResize({ trigger }: { trigger: unknown }) {
  const map = useMap();
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      map.invalidateSize();
      setTimeout(() => map.invalidateSize(), 200);
    });
    return () => cancelAnimationFrame(raf);
  }, [trigger, map]);
  return null;
}

export const LineMap = ({ numeroLinha, nomeLinha, cor, mapSentido }: LineMapProps) => {
  const { vehicles, lastFetch, refresh, loading, error } = useLineVehicles(numeroLinha, mapSentido);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [fullscreen]);

  const center = useMemo<[number, number]>(() => {
    if (vehicles.length > 0) return [vehicles[0].lat, vehicles[0].lng];
    return [-21.7058, -45.2519]; // Três Corações default
  }, [vehicles]);

  return (
    <div
      ref={containerRef}
      className={
        fullscreen
          ? "fixed inset-0 z-[9999] bg-background"
          : "relative rounded-2xl overflow-hidden border border-border bg-card shadow-card"
      }
      style={fullscreen ? {} : { height: 420 }}
    >
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        style={{ width: "100%", height: fullscreen ? "100%" : 420 }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterOnVehicles vehicles={vehicles} />
        <InvalidateOnResize trigger={fullscreen} />
        {vehicles.map((v) => {
          const color = STATUS_COLOR[v.status];
          const label = v.codigo || v.placa || "?";
          const icon = vehicleIcon(color, v.bearing || 0, label, v.status === "moving");
          const statusLabel =
            v.status === "moving" ? "em movimento" : v.status === "idle" ? "parado ≤1min" : "parado +1min";
          return (
            <Marker key={v.codigo} position={[v.lat, v.lng]} icon={icon}>
              <Popup>
                <div className="text-xs space-y-0.5 min-w-[220px]">
                  <div className="font-semibold text-sm mb-1">
                    Linha {numeroLinha}{nomeLinha ? ` — ${nomeLinha}` : ""}
                  </div>
                  {v.placa && <div>Placa: {v.placa}</div>}
                  <div>Veículo: {v.codigo}</div>
                  <div>Velocidade: {v.velocidade} km/h</div>
                  <div>Sentido: {v.sentido || "—"}</div>
                  <div>Estado: {statusLabel}</div>
                  <div>Rumo: {Math.round(v.bearing || 0)}°</div>
                  {v.trajeto && (
                    <div className="pt-1 text-muted-foreground">{v.trajeto}</div>
                  )}
                  <div className="text-muted-foreground">
                    Última posição: {new Date(v.dataHora).toLocaleTimeString("pt-BR")}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend (top-left) */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow px-3 py-2 text-xs max-w-[calc(100%-1.5rem)]">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLOR.moving }} />Em movimento</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLOR.idle }} />Parado ≤1min</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLOR.stopped }} />Parado +1min</span>
      </div>

      {/* Status + controls (bottom-right) */}
      <div className="absolute bottom-3 right-3 z-[1000] flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow px-3 py-2 text-xs">
        {error ? (
          <span className="text-destructive">{error}</span>
        ) : (
          <span className="text-muted-foreground">
            {lastFetch ? `Atualizado ${new Date(lastFetch).toLocaleTimeString("pt-BR")}` : "Carregando…"}
          </span>
        )}
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-secondary"
          aria-label="Atualizar veículos"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
        <button
          type="button"
          onClick={() => setFullscreen((v) => !v)}
          className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-secondary"
          aria-label={fullscreen ? "Sair de tela cheia" : "Tela cheia"}
        >
          {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};