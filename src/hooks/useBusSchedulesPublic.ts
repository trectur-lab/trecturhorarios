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
const CACHE_VERSION = 2;
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h -> cache considerado só para offline
const REVALIDATE_MIN_INTERVAL_MS = 2 * 60 * 1000; // 2min entre revalidações automáticas

function loadCache(): CachedData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedData;
    if (parsed?.version !== CACHE_VERSION) {
      // Cache de versão antiga: descarta para não exibir dados desatualizados
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
    // localStorage full or unavailable
  }
}


export function useBusSchedulesPublic() {
  const [lines, setLines] = useState<PublicBusLine[]>([]);
  const [schedulesMap, setSchedulesMap] = useState<CachedData['schedules']>({});
  const [specialDates, setSpecialDates] = useState<SpecialDatesMap>({});
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const lastFetchRef = useRef(0);


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

    console.log(`[DEBUG] Fetched ${linesData.length} lines, ${schedulesData.length} schedules from DB`);

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

  // Initial load: cache first, then DB if online
  useEffect(() => {
    const init = async () => {
      setLoading(true);

      // Load cache immediately
      const cached = loadCache();
      const cacheAge = cached ? Date.now() - new Date(cached.cachedAt).getTime() : Infinity;
      const cacheIsStale = cacheAge > CACHE_MAX_AGE_MS;
      if (cached) {
        applyData(cached);
      }

      // Try to fetch fresh data
      if (navigator.onLine) {
        try {
          const fresh = await fetchFromDB();
          if (fresh) {
            applyData(fresh);
            saveCache(fresh);
            lastFetchRef.current = Date.now();
          }
        } catch (err) {
          console.error('Error fetching bus data:', err);
          // If no cache (or cache muito antigo), show error
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
  }, [fetchFromDB, applyData]);

  // Silent revalidation (visibilitychange / online), throttled
  const revalidate = useCallback(async () => {
    if (!navigator.onLine) return;
    if (Date.now() - lastFetchRef.current < REVALIDATE_MIN_INTERVAL_MS) return;
    lastFetchRef.current = Date.now();
    try {
      const fresh = await fetchFromDB();
      if (fresh) {
        applyData(fresh);
        saveCache(fresh);
      }
    } catch (err) {
      console.error('Error revalidating bus data:', err);
    }
  }, [fetchFromDB, applyData]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') void revalidate();
    };
    const onOnline = () => void revalidate();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    window.addEventListener('online', onOnline);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
      window.removeEventListener('online', onOnline);
    };
  }, [revalidate]);

  // Manual refresh
  const refreshData = useCallback(async () => {
    if (!navigator.onLine) {
      toast.error('Sem conexão com a internet');
      return;
    }

    setIsRefreshing(true);
    try {
      const fresh = await fetchFromDB();
      if (fresh) {
        applyData(fresh);
        saveCache(fresh);
        lastFetchRef.current = Date.now();
        toast.success('Dados atualizados com sucesso');
      }
    } catch (err) {
      console.error('Error refreshing:', err);
      toast.error('Erro ao atualizar dados');
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchFromDB, applyData]);


  return {
    lines,
    schedulesMap,
    specialDates,
    loading,
    isRefreshing,
    isOnline,
    lastUpdated,
    refreshData,
  };
}
