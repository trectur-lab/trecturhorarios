import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLineVehicles, VehiclePosition, distanceMeters } from "@/hooks/useLineVehicles";
import { useLineRoute } from "@/hooks/useLineRoute";
import { Card } from "@/components/ui/card";
import { Loader2, AlertCircle, Bus, RefreshCw, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LineMapProps {
  numeroLinha: string;
  lineColor: string;
  lineNome: string;
  mapSentido?: 'ida' | 'volta' | null;
}

const InvalidateOnResize = ({ trigger }: { trigger: unknown }) => {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [trigger, map]);
  return null;
};

const FitBounds = ({
  vehicles,
  shape,
}: {
  vehicles: VehiclePosition[];
  shape: [number, number][];
}) => {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = [
      ...shape,
      ...vehicles.map((v) => [v.lat, v.lng] as [number, number]),
    ];
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 15, { animate: true });
    } else {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [vehicles, shape, map]);
  return null;
};

const STATUS_COLORS = {
  moving: "#16a34a", // verde
  idle: "#2563eb",   // azul
  stopped: "#dc2626", // vermelho
} as const;

// Garagem da Viação Três Corações Ltda
const GARAGE = { lat: -21.709497, lng: -45.264057 };
const GARAGE_RADIUS_M = 75;
const MAX_POSITION_AGE_MS = 10 * 60 * 1000;

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );

const buildArrowIcon = (
  status: "moving" | "idle" | "stopped",
  bearing: number | null,
  codigo: string,
) => {
  const color = STATUS_COLORS[status];
  const opacity = 1;
  const safeCodigo = escapeHtml(codigo ?? "");

  const labelHtml = `
    <span style="
      display:inline-block;
      padding:1px 5px;
      font:600 11px/1.2 Inter,system-ui,sans-serif;
      color:#111;
      background:rgba(255,255,255,0.92);
      border:1.5px solid ${color};
      border-radius:4px;
      box-shadow:0 1px 2px rgba(0,0,0,0.35);
      white-space:nowrap;
      opacity:${opacity};
    ">${safeCodigo}</span>`;

  // Glyph (seta rotacionada ou bolinha)
  let glyphHtml: string;
  let glyphSize = 30;
  if (status === "stopped" || bearing == null) {
    glyphSize = 18;
    glyphHtml = `
      <div style="
        width:18px;height:18px;border-radius:50%;
        background:${color};border:3px solid #fff;
        opacity:${opacity};
        box-shadow:0 1px 3px rgba(0,0,0,0.5);
        flex:none;
      "></div>`;
  } else {
    glyphHtml = `
      <div style="
        width:30px;height:30px;flex:none;
        opacity:${opacity};
        transform: rotate(${bearing}deg);
        transform-origin: 50% 50%;
        display:flex;align-items:center;justify-content:center;
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
      ">
        <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 2 L26 26 L15 21 L4 26 Z"
            fill="${color}" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
        </svg>
      </div>`;
  }

  const half = glyphSize / 2;
  const html = `
    <div style="
      display:flex;align-items:center;gap:4px;
      width:max-content;
    ">
      ${glyphHtml}
      ${labelHtml}
    </div>`;

  return L.divIcon({
    className: "trectur-bus-arrow",
    html,
    iconSize: [0, 0],
    iconAnchor: [half, half],
  });
};

const formatTime = (raw: number | string | null): string => {
  if (raw == null) return "—";
  const d = typeof raw === "number" ? new Date(raw) : new Date(raw);
  if (isNaN(d.getTime())) return String(raw);
  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const LineMap = ({
  numeroLinha,
  lineColor,
  lineNome,
  mapSentido,
}: LineMapProps) => {
  const { vehicles, loading, error, lastUpdated, refresh } =
    useLineVehicles(numeroLinha);
  const shape = useLineRoute(numeroLinha);

  // Garagem da Viação Três Corações Ltda — veículos dentro deste raio são ocultados.
  const visibleVehicles = useMemo(() => {
    const now = Date.now();
    return vehicles.filter((v) => {
      if (distanceMeters({ lat: v.lat, lng: v.lng }, GARAGE) <= GARAGE_RADIUS_M) {
        return false;
      }
      if (v.dataHora != null) {
        const t =
          typeof v.dataHora === "number"
            ? v.dataHora
            : new Date(v.dataHora).getTime();
        if (!isNaN(t) && now - t > MAX_POSITION_AGE_MS) return false;
      }
      if (mapSentido) {
        if (!v.sentido) return false;
        if (v.sentido.toLowerCase() !== mapSentido) return false;
      }
      return true;
    });
  }, [vehicles, mapSentido]);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen]);

  const defaultCenter: [number, number] = [-21.6981, -45.2519];

  return (
    <Card
      className={cn(
        "overflow-hidden",
        isFullscreen &&
          "fixed inset-0 z-[9999] rounded-none flex flex-col border-0",
      )}
    >
      <div className="px-4 py-2 flex items-center justify-between text-xs text-muted-foreground border-b border-border gap-2">
        <span className="flex items-center gap-1.5">
          <Bus className="w-3.5 h-3.5" />
          {visibleVehicles.length > 0
            ? `${visibleVehicles.length} veículo${visibleVehicles.length > 1 ? "s" : ""} em circulação`
            : "Linha " + numeroLinha}
        </span>
        <span className="flex items-center gap-2">
          {loading && <Loader2 className="w-3 h-3 animate-spin" />}
          {lastUpdated && (
            <span>
              {lastUpdated.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          )}
          <button
            onClick={refresh}
            className="hover:text-foreground transition-colors"
            aria-label="Atualizar mapa"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </span>
      </div>


      <div className="px-4 py-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground border-b border-border">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: "#16a34a" }} /> em movimento
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: "#2563eb" }} /> parado ≤ 1 min
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: "#dc2626" }} /> parado &gt; 1 min
        </span>
      </div>

      {error && (
        <div className="px-4 py-3 flex items-start gap-2 bg-destructive/10 text-destructive text-sm border-b border-destructive/30">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div
        className={cn(
          "w-full bg-muted relative",
          isFullscreen ? "flex-1" : "h-[320px]",
        )}
      >
        <MapContainer
          center={defaultCenter}
          zoom={13}
          scrollWheelZoom={isFullscreen}
          style={{ height: "100%", width: "100%" }}
        >
          <InvalidateOnResize trigger={isFullscreen} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds vehicles={visibleVehicles} shape={shape} />
          {shape.length >= 2 && (
            <Polyline
              positions={shape}
              pathOptions={{ color: lineColor, weight: 4, opacity: 0.7 }}
            />
          )}
          {visibleVehicles.map((v) => {
            return (
              <Marker
                key={v.codigo || `${v.lat},${v.lng}`}
                position={[v.lat, v.lng]}
                icon={buildArrowIcon(v.status, v.bearing, v.codigo)}
              >
                <Popup>
                  <div className="text-sm space-y-0.5">
                    <div className="font-semibold">
                      Linha {numeroLinha} — {lineNome}
                    </div>
                    {v.placa && <div>Placa: {v.placa}</div>}
                    <div>Veículo: {v.codigo}</div>
                    <div>Velocidade: {v.velocidade.toFixed(0)} km/h</div>
                    {v.sentido && <div>Sentido: {v.sentido}</div>}
                    <div>
                      Estado:{" "}
                      {v.status === "moving"
                        ? "em movimento"
                        : v.status === "idle"
                        ? `parado há ${v.stoppedForSec}s`
                        : `parado há ${Math.floor(v.stoppedForSec / 60)} min`}
                    </div>
                    {v.bearing != null && v.status !== "stopped" && (
                      <div>Rumo: {v.bearing.toFixed(0)}°</div>
                    )}
                    {v.trajeto && (
                      <div className="text-xs text-muted-foreground">
                        {v.trajeto}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Última posição: {formatTime(v.dataHora)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        {!loading && !error && visibleVehicles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-background/40">
            <span className="text-sm text-muted-foreground bg-background/80 px-3 py-1.5 rounded-md">
              Nenhum ônibus em circulação no momento.
            </span>
          </div>
        )}
        <button
          onClick={() => setIsFullscreen((v) => !v)}
          aria-label={isFullscreen ? "Fechar tela cheia" : "Tela cheia"}
          title={isFullscreen ? "Fechar tela cheia (Esc)" : "Tela cheia"}
          className={cn(
            "absolute top-3 right-3 z-[400]",
            "inline-flex items-center justify-center w-9 h-9 rounded-lg",
            "bg-background/95 backdrop-blur-sm border border-border",
            "text-foreground shadow-lg",
            "transition-all duration-200",
            "hover:bg-background hover:scale-105 hover:shadow-xl",
            "active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </Card>
  );
};
