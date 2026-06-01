import { useState, useEffect, useCallback } from 'react';
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
}

interface CachedData {
  lines: PublicBusLine[];
  schedules: Record<number, {
    uteis: Record<string, ScheduleItem[]>;
    sabados: Record<string, ScheduleItem[]>;
    domingos: Record<string, ScheduleItem[]>;
  }>;
  cachedAt: string;
}

const CACHE_KEY = 'trectur_bus_data';
const SPECIAL_CACHE_KEY = 'trectur_special_dates';

type OverrideKind = 'uteis' | 'sabados' | 'domingos' | 'no_service';

interface SpecialDateRow {
  id: string;
  date: string;
  default_override: OverrideKind | null;
}
interface OverrideRow {
  special_date_id: string;
  bus_line_id: number;
  override: OverrideKind;
}

function loadCache(): CachedData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveCache(data: CachedData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

export function useBusSchedulesPublic() {
  const [lines, setLines] = useState<PublicBusLine[]>([]);
  const [schedulesMap, setSchedulesMap] = useState<CachedData['schedules']>({});
  const [specialDates, setSpecialDates] = useState<SpecialDateRow[]>([]);
  const [overrides, setOverrides] = useState<OverrideRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

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

  const fetchSpecialDates = useCallback(async () => {
    const [d, o] = await Promise.all([
      supabase.from('special_dates').select('id, date, default_override'),
      supabase.from('special_date_line_overrides').select('special_date_id, bus_line_id, override'),
    ]);
    if (!d.error && d.data) {
      setSpecialDates(d.data as SpecialDateRow[]);
      try { localStorage.setItem(SPECIAL_CACHE_KEY, JSON.stringify({ dates: d.data, overrides: o.data ?? [] })); } catch {}
    }
    if (!o.error && o.data) setOverrides(o.data as OverrideRow[]);
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
    }));

    return {
      lines: publicLines,
      schedules,
      cachedAt: new Date().toISOString(),
    };
  }, []);

  const applyData = useCallback((data: CachedData) => {
    setLines(data.lines);
    setSchedulesMap(data.schedules);
    setLastUpdated(data.cachedAt);
  }, []);

  // Initial load: cache first, then DB if online
  useEffect(() => {
    const init = async () => {
      setLoading(true);

      // Load cache immediately
      const cached = loadCache();
      if (cached) {
        applyData(cached);
      }
      try {
        const sc = localStorage.getItem(SPECIAL_CACHE_KEY);
        if (sc) {
          const parsed = JSON.parse(sc);
          setSpecialDates(parsed.dates ?? []);
          setOverrides(parsed.overrides ?? []);
        }
      } catch {}

      // Try to fetch fresh data
      if (navigator.onLine) {
        try {
          const fresh = await fetchFromDB();
          if (fresh) {
            applyData(fresh);
            saveCache(fresh);
          }
          await fetchSpecialDates();
        } catch (err) {
          console.error('Error fetching bus data:', err);
          // If no cache, show error
          if (!cached) {
            toast.error('Erro ao carregar horários');
          }
        }
      } else if (!cached) {
        toast.error('Sem conexão e sem dados em cache');
      }

      setLoading(false);
    };

    init();
  }, [fetchFromDB, applyData, fetchSpecialDates]);

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
        toast.success('Dados atualizados com sucesso');
      }
      await fetchSpecialDates();
    } catch (err) {
      console.error('Error refreshing:', err);
      toast.error('Erro ao atualizar dados');
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchFromDB, applyData, fetchSpecialDates]);

  const resolveOverride = useCallback(
    (date: string, lineId: number): OverrideKind | null => {
      const sd = specialDates.find((s) => s.date === date);
      if (!sd) return null;
      const lineOverride = overrides.find(
        (o) => o.special_date_id === sd.id && o.bus_line_id === lineId,
      );
      return lineOverride?.override ?? sd.default_override ?? null;
    },
    [specialDates, overrides],
  );

  const resolveDayType = useCallback(
    (date: string, lineId: number): 'uteis' | 'sabados' | 'domingos' | null => {
      const ov = resolveOverride(date, lineId);
      if (!ov || ov === 'no_service') return null;
      return ov;
    },
    [resolveOverride],
  );

  const isNoService = useCallback(
    (date: string, lineId: number) => resolveOverride(date, lineId) === 'no_service',
    [resolveOverride],
  );

  return {
    lines,
    schedulesMap,
    loading,
    isRefreshing,
    isOnline,
    lastUpdated,
    refreshData,
    resolveDayType,
    isNoService,
  };
}
