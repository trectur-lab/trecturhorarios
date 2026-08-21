import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Selectors } from './Selectors';
import { TimeDisplay } from './TimeDisplay';
import { ScheduleGrid } from './ScheduleGrid';
import { useBusSchedulesPublic, ScheduleItem } from '@/hooks/useBusSchedulesPublic';
import { LineMap } from './LineMap';
import { RefreshCw, Loader2 } from 'lucide-react';

type DayType = 'uteis' | 'sabados' | 'domingos';

export const BusSchedule = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [selectedDirection, setSelectedDirection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { lines, schedulesMap, specialDates, loading, isRefreshing, lastUpdated, refreshData } =
    useBusSchedulesPublic();

  const lastUpdatedMs = lastUpdated ? new Date(lastUpdated).getTime() : null;
  const isStale = lastUpdatedMs != null && currentTime.getTime() - lastUpdatedMs > 15 * 60 * 1000;
  const formatRelative = (iso: string) => {
    const diffMin = Math.max(0, Math.round((currentTime.getTime() - new Date(iso).getTime()) / 60000));
    if (diffMin < 1) return 'agora mesmo';
    if (diffMin < 60) return `há ${diffMin} min`;
    const h = Math.floor(diffMin / 60);
    if (h < 24) return `há ${h} h`;
    const d = Math.floor(h / 24);
    return `há ${d} dia${d > 1 ? 's' : ''}`;
  };


  // Set initial selection when lines load
  useEffect(() => {
    if (lines.length > 0 && selectedLine === null) {
      setSelectedLine(lines[0].id);
      if (lines[0].directions.length > 0) {
        setSelectedDirection(lines[0].directions[0]);
      }
    }
  }, [lines, selectedLine]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getDefaultDayType = (date: string): DayType => {
    const d = new Date(date + 'T12:00:00');
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0) return 'domingos';
    if (dayOfWeek === 6) return 'sabados';
    return 'uteis';
  };

  const specialInfo = specialDates[selectedDate];
  const lineOverride = selectedLine != null ? specialInfo?.overrides[selectedLine] : undefined;
  const isNoService = lineOverride === 'no_service';
  const dayType: DayType =
    lineOverride && lineOverride !== 'no_service'
      ? (lineOverride as DayType)
      : getDefaultDayType(selectedDate);

  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const selectedLinha = lines.find(l => l.id === selectedLine);
  const lineSchedules = selectedLine ? schedulesMap[selectedLine] : null;
  const schedule: ScheduleItem[] = isNoService
    ? []
    : lineSchedules?.[dayType]?.[selectedDirection] || [];

  const getNextBus = (): (ScheduleItem & { index: number }) | null => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const todayDate = new Date().toISOString().split('T')[0];
    const isToday = selectedDate === todayDate;

    if (!isToday) {
      return schedule.length > 0 ? { ...schedule[0], index: 0 } : null;
    }

    for (let i = 0; i < schedule.length; i++) {
      const busMinutes = parseTime(schedule[i].hora);
      if (busMinutes >= currentMinutes) {
        return { ...schedule[i], index: i };
      }
    }
    return null;
  };

  const nextBus = getNextBus();

  const calculateTimeToNext = () => {
    if (!nextBus) return null;
    const now = new Date();
    const [hours, minutes] = nextBus.hora.split(':').map(Number);
    const busTime = new Date();
    busTime.setHours(hours, minutes, 0, 0);
    const todayDate = new Date().toISOString().split('T')[0];
    if (selectedDate !== todayDate) return null;
    const diff = busTime.getTime() - now.getTime();
    if (diff < 0) return null;
    const totalMinutes = Math.floor(diff / 1000 / 60);
    return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60, totalMinutes };
  };

  const timeToNext = calculateTimeToNext();

  const handleLineChange = (lineId: number) => {
    setSelectedLine(lineId);
    const newLinha = lines.find(l => l.id === lineId);
    if (newLinha && newLinha.directions.length > 0) {
      setSelectedDirection(newLinha.directions[0]);
    }
  };


  if (loading && lines.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Selectors */}
        <section className="bg-card rounded-2xl p-5 border border-border shadow-card">
          <Selectors
            lines={lines}
            selectedLine={selectedLine || 0}
            selectedDirection={selectedDirection}
            selectedDate={selectedDate}
            selectedLinha={selectedLinha}
            onLineChange={handleLineChange}
            onDirectionChange={setSelectedDirection}
            onDateChange={setSelectedDate}
          />
        </section>

        {/* Special date banner */}
        {specialInfo && (
          <section className="bg-primary/10 border border-primary/40 rounded-xl px-4 py-3 text-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wide">
                Data especial
              </span>
              {specialInfo.description && (
                <span className="font-medium">{specialInfo.description}</span>
              )}
              {!isNoService && lineOverride && (
                <span className="text-muted-foreground">
                  • Esta linha está rodando como <strong>{dayType === 'uteis' ? 'Dias Úteis' : dayType === 'sabados' ? 'Sábados' : 'Domingos/Feriados'}</strong>
                </span>
              )}
            </div>
          </section>
        )}

        {/* Time Display */}
        {!isNoService && (
          <section className="animate-fade-in">
            <TimeDisplay
              currentTime={currentTime}
              nextBus={nextBus}
              timeToNext={timeToNext}
              lineColor={selectedLinha?.cor || '#e74c3c'}
            />
          </section>
        )}

        {/* Route Info */}
        {selectedLinha?.via && (
          <section className="bg-card/50 rounded-xl px-4 py-3 border border-border flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Rota:</span>
            <span className="font-medium">{selectedLinha.nome}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{selectedLinha.via}</span>
          </section>
        )}

        {/* Schedule Grid or No Service */}
        <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          {isNoService ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-2">
              <p className="text-lg font-bold text-destructive">Linha não opera nesta data</p>
              <p className="text-sm text-muted-foreground">
                {specialInfo?.description || 'Data especial sem operação para esta linha.'}
              </p>
            </div>
          ) : (
            <ScheduleGrid
              schedule={schedule}
              nextBusIndex={nextBus?.index ?? null}
              dayType={dayType}
              lineColor={selectedLinha?.cor || '#e74c3c'}
            />
          )}
        </section>

        {/* Interactive Map - Live Vehicle Position */}
        {selectedLinha && (() => {
          const directionIndex = selectedLinha.directions.indexOf(selectedDirection);
          const mapSentido: 'ida' | 'volta' | null =
            directionIndex < 0 ? null : directionIndex === 0 ? 'ida' : 'volta';
          return (
            <section className="animate-fade-in" style={{ animationDelay: '150ms' }}>
              <LineMap
                numeroLinha={selectedLinha.numero}
                lineColor={selectedLinha.cor || '#e74c3c'}
                lineNome={selectedLinha.nome}
                mapSentido={mapSentido}
              />
            </section>
          );
        })()}

        {/* Footer with Reload Button */}
        <footer className="text-center text-sm text-muted-foreground py-6 space-y-3">
          <div className="flex flex-col items-center justify-center gap-2">
            <button
              onClick={() => refreshData()}
              disabled={isRefreshing}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors disabled:opacity-60 ${
                isStale
                  ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                  : 'bg-secondary hover:bg-secondary/80 border-border text-foreground'
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Atualizando...' : 'Atualizar'}
            </button>
            {lastUpdated && (
              <span className="text-xs">
                Atualizado {formatRelative(lastUpdated)}
                {isStale && ' — toque em Atualizar para ver a versão mais recente'}
              </span>
            )}
          </div>
          <p>Horários sujeitos a alterações</p>
        </footer>

      </main>
    </div>
  );
};
