import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ScheduleItem {
  hora: string;
  obs: string;
}

export interface PublicBusLine {
  id: number;
  numero: string;
  nome: string;
  via: string | null;
  cor: string;
  directions: string[];
  sonda_codigo_veiculo?: string | null;
}

export type SpecialDateDayType = 'uteis' | 'sabados' | 'domingos' | 'no_service';

export interface SpecialDateInfo {
  description: string;
  overrides: Record<number, SpecialDateDayType>;
}

export type SpecialDatesMap = Record<string, SpecialDateInfo>;

interface CachedData {
  lines: PublicBusLine[];
  schedules: Record<number, {
    uteis: Record<string, ScheduleItem[]>;
    sabados: Record<string, ScheduleItem[]>;
    domingos: Record<string, ScheduleItem[]>;
  }>;
  specialDates: SpecialDatesMap;
  cachedAt: string;
  version?: number;
}

const CACHE_KEY = 'trectur_bus_data';
const CACHE_VERSION = 4;
const CACHE_MAX_AGE_MS = 10 * 60 * 1000; // cache é apenas fallback offline
const REVALIDATE_MIN_INTERVAL_MS = 15 * 1000; // throttle só para revalidações "passivas"
const REALTIME_DEBOUNCE_MS = 700; // agrupa alterações em lote
const SAFETY_POLL_MS = 5 * 60 * 1000; // rede de segurança caso o Realtime caia

function loadCache(): CachedData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedData;
    if (parsed?.version !== CACHE_VERSION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveCache(data: CachedData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, version: CACHE_VERSION }));
  } catch {
    // localStorage cheio ou indisponível
  }
}


export function useBusSchedulesPublic() {
  const [lines, setLines] = useState<PublicBusLine[]>([]);
  const [schedulesMap, setSchedulesMap] = useState<CachedData['schedules']>({});
  const [specialDates, setSpecialDates] = useState<SpecialDatesMap>({});
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const lastFetchRef = useRef(0);
  const inFlightRef = useRef<Promise<void> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  // Online/offline monitoring
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const fetchFromDB = useCallback(async (): Promise<CachedData | null> => {
    // Fetch all lines
    const { data: linesData, error: linesError } = await supabase
      .from('bus_lines')
      .select('*')
      .order('numero');

    if (linesError) throw linesError;
    if (!linesData || linesData.length === 0) return null;

    // Fetch all schedules (paginated to bypass 1000-row default limit)
    let allSchedules: any[] = [];
    let from = 0;
    const PAGE_SIZE = 1000;

    while (true) {
      const { data: page, error: pageError } = await supabase
        .from('bus_schedules')
        .select('*')
        .range(from, from + PAGE_SIZE - 1)
        .order('hora');

      if (pageError) throw pageError;
      if (!page || page.length === 0) break;

      allSchedules = allSchedules.concat(page);
      if (page.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }

    const schedulesData = allSchedules;

    // Transform schedules into grouped structure
    const schedules: CachedData['schedules'] = {};

    for (const line of linesData) {
      schedules[line.id] = { uteis: {}, sabados: {}, domingos: {} };
    }

    for (const s of (schedulesData || [])) {
      const lineSchedules = schedules[s.bus_line_id];
      if (!lineSchedules) continue;

      const dayKey = s.day_type as 'uteis' | 'sabados' | 'domingos';
      if (!lineSchedules[dayKey]) continue;
      if (!lineSchedules[dayKey][s.direction]) lineSchedules[dayKey][s.direction] = [];

      // Never filter by obs — include schedule regardless of obs value
      lineSchedules[dayKey][s.direction].push({
        hora: s.hora,
        obs: s.obs ?? '',
      });
    }

    console.log(`[DATA] ${linesData.length} linhas, ${schedulesData.length} horários carregados do banco`);

    // Sort each direction's schedules by time
    for (const lineId of Object.keys(schedules)) {
      const ls = schedules[Number(lineId)];
      for (const dayType of ['uteis', 'sabados', 'domingos'] as const) {
        for (const dir of Object.keys(ls[dayType])) {
          ls[dayType][dir].sort((a, b) => a.hora.localeCompare(b.hora));
        }
      }
    }

    const publicLines: PublicBusLine[] = linesData.map(l => ({
      id: l.id,
      numero: l.numero,
      nome: l.nome,
      via: l.via,
      cor: l.cor,
      directions: l.directions,
      sonda_codigo_veiculo: (l as any).sonda_codigo_veiculo ?? null,
    }));

    // Fetch special dates + overrides
    const specialDates: SpecialDatesMap = {};
    const { data: sdRows } = await supabase
      .from('special_dates')
      .select('id, date, description');
    if (sdRows && sdRows.length > 0) {
      const byId: Record<string, { date: string; description: string }> = {};
      for (const r of sdRows) {
        byId[r.id] = { date: r.date, description: r.description || '' };
      }
      const { data: ovs } = await supabase
        .from('special_date_line_overrides')
        .select('special_date_id, bus_line_id, day_type');
      const ovByDateId: Record<string, Record<number, SpecialDateDayType>> = {};
      for (const o of ovs || []) {
        const m = (ovByDateId[o.special_date_id] = ovByDateId[o.special_date_id] || {});
        m[o.bus_line_id] = o.day_type as SpecialDateDayType;
      }
      for (const id of Object.keys(byId)) {
        const meta = byId[id];
        specialDates[meta.date] = {
          description: meta.description,
          overrides: ovByDateId[id] || {},
        };
      }
    }

    return {
      lines: publicLines,
      schedules,
      specialDates,
      cachedAt: new Date().toISOString(),
    };
  }, []);

  const applyData = useCallback((data: CachedData) => {
    setLines(data.lines);
    setSchedulesMap(data.schedules);
    setSpecialDates(data.specialDates || {});
    setLastUpdated(data.cachedAt);
  }, []);

  /**
   * Consulta completa ao banco (fonte da verdade) e substituição total do estado.
   * `force` ignora o throttle — usado por Realtime e pelo botão manual.
   */
  const syncFromServer = useCallback(
    async (reason: string, force = false): Promise<boolean> => {
      if (!navigator.onLine) return false;
      if (!force && Date.now() - lastFetchRef.current < REVALIDATE_MIN_INTERVAL_MS) return false;
      if (inFlightRef.current) {
        await inFlightRef.current;
        return true;
      }

      let ok = false;
      const run = (async () => {
        try {
          const fresh = await fetchFromDB();
          if (fresh) {
            applyData(fresh);
            saveCache(fresh);
            lastFetchRef.current = Date.now();
            ok = true;
            console.log(`[DATA] Última atualização: ${fresh.cachedAt} (motivo: ${reason})`);
          }
        } catch (err) {
          console.error(`[DATA] Falha ao sincronizar (${reason}):`, err);
          throw err;
        } finally {
          inFlightRef.current = null;
        }
      })();

      inFlightRef.current = run;
      await run;
      return ok;
    },
    [fetchFromDB, applyData],
  );

  // Initial load: cache first (pintura instantânea), banco em seguida como fonte oficial
  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const cached = loadCache();
      const cacheAge = cached ? Date.now() - new Date(cached.cachedAt).getTime() : Infinity;
      const cacheIsStale = cacheAge > CACHE_MAX_AGE_MS;
      if (cached) {
        applyData(cached);
      }

      if (navigator.onLine) {
        try {
          await syncFromServer('carga inicial', true);
        } catch {
          if (!cached) {
            toast.error('Erro ao carregar horários');
          } else if (cacheIsStale) {
            toast.error('Não foi possível atualizar. Exibindo dados salvos no aparelho.');
          }
        }
      } else if (!cached) {
        toast.error('Sem conexão e sem dados em cache');
      }

      setLoading(false);
    };

    init();
  }, [syncFromServer, applyData]);

  // Realtime: qualquer alteração nas tabelas públicas dispara um refetch completo (com debounce)
  useEffect(() => {
    const scheduleRefetch = (table: string) => {
      console.log(`[REALTIME] Alteração detectada em ${table}`);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        console.log('[REALTIME] Revalidando dados...');
        void syncFromServer('evento realtime', true)
          .then((ok) => {
            if (ok) console.log('[REALTIME] Dados atualizados');
          })
          .catch(() => {
            /* erro já logado */
          });
      }, REALTIME_DEBOUNCE_MS);
    };

    const tables = [
      'bus_schedules',
      'bus_lines',
      'special_dates',
      'special_date_line_overrides',
    ] as const;

    let disposed = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const connect = () => {
      if (disposed) return;
      const ch = supabase.channel(`public-schedule-updates-${Math.random().toString(36).slice(2)}`);
      for (const table of tables) {
        ch.on('postgres_changes', { event: '*', schema: 'public', table }, () =>
          scheduleRefetch(table),
        );
      }
      ch.subscribe((status) => {
        if (disposed) return;
        if (status === 'SUBSCRIBED') {
          console.log('[REALTIME] Conectado');
          setIsLive(true);
          // Após (re)conectar, garante que nada foi perdido durante a queda
          void syncFromServer('reconexão realtime', true).catch(() => {});
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setIsLive(false);
          console.warn(`[REALTIME] Conexão perdida (${status}). Reconectando...`);
          if (retryTimer) clearTimeout(retryTimer);
          retryTimer = setTimeout(() => {
            if (disposed) return;
            supabase.removeChannel(ch);
            connect();
          }, 3000);
        }
      });
      channel = ch;
    };

    connect();

    return () => {
      disposed = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (channel) supabase.removeChannel(channel);
    };
  }, [syncFromServer]);

  // Revalidação ao voltar ao primeiro plano / recuperar conexão
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void syncFromServer('app em primeiro plano').catch(() => {});
      }
    };
    const onOnline = () => {
      console.log('[DATA] Conexão restabelecida — buscando dados atuais');
      void syncFromServer('voltou a ficar online', true).catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    window.addEventListener('online', onOnline);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
      window.removeEventListener('online', onOnline);
    };
  }, [syncFromServer]);

  // Rede de segurança: polling leve caso o Realtime esteja indisponível
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      void syncFromServer('polling de segurança').catch(() => {});
    }, SAFETY_POLL_MS);
    return () => clearInterval(id);
  }, [syncFromServer]);

  // Manual refresh
  const refreshData = useCallback(async () => {
    if (!navigator.onLine) {
      toast.error('Sem conexão com a internet');
      return;
    }

    setIsRefreshing(true);
    try {
      const ok = await syncFromServer('atualização manual', true);
      if (ok) toast.success('Dados atualizados com sucesso');
    } catch {
      toast.error('Erro ao atualizar dados');
    } finally {
      setIsRefreshing(false);
    }
  }, [syncFromServer]);


  return {
    lines,
    schedulesMap,
    specialDates,
    loading,
    isRefreshing,
    isOnline,
    isLive,
    lastUpdated,
    refreshData,
  };
}
