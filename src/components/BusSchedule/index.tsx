import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Selectors } from './Selectors';
import { TimeDisplay } from './TimeDisplay';
import { ScheduleGrid } from './ScheduleGrid';
import { LineMap } from './LineMap';
import { useBusSchedulesPublic, ScheduleItem } from '@/hooks/useBusSchedulesPublic';
import { RefreshCw, Loader2 } from 'lucide-react';

type DayType = 'uteis' | 'sabados' | 'domingos';

export const BusSchedule = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [selectedDirection, setSelectedDirection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { lines, schedulesMap, loading, resolveDayType, isNoService } = useBusSchedulesPublic();

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

  const getDayType = (date: string, lineId: number | null): DayType => {
    if (lineId != null) {
      const overridden = resolveDayType(date, lineId);
      if (overridden) return overridden;
    }
    const d = new Date(date + 'T12:00:00');
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0) return 'domingos';
    if (dayOfWeek === 6) return 'sabados';
    return 'uteis';
  };

  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const selectedLinha = lines.find(l => l.id === selectedLine);
  const dayType = getDayType(selectedDate, selectedLine);
  const noService = selectedLine != null && isNoService(selectedDate, selectedLine);
  const lineSchedules = selectedLine ? schedulesMap[selectedLine] : null;
  const schedule: ScheduleItem[] = noService
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

  const directionIndex = selectedLinha?.directions.indexOf(selectedDirection) ?? -1;
  const mapSentido: "ida" | "volta" | null =
    directionIndex < 0 ? null : directionIndex === 0 ? "ida" : "volta";

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

        {/* Time Display */}
        <section className="animate-fade-in">
          <TimeDisplay
            currentTime={currentTime}
            nextBus={nextBus}
            timeToNext={timeToNext}
            lineColor={selectedLinha?.cor || '#e74c3c'}
          />
        </section>

        {/* Route Info */}
        {selectedLinha?.via && (
          <section className="bg-card/50 rounded-xl px-4 py-3 border border-border flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Rota:</span>
            <span className="font-medium">{selectedLinha.nome}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{selectedLinha.via}</span>
          </section>
        )}

        {/* Schedule Grid */}
        <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          {noService ? (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-2xl p-6 text-center font-medium">
              Linha não opera nesta data
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

        {/* Mapa em tempo real */}
        {selectedLinha && !noService && (
          <section className="animate-fade-in" style={{ animationDelay: '150ms' }}>
            <LineMap
              numeroLinha={selectedLinha.numero}
              nomeLinha={selectedLinha.nome}
              cor={selectedLinha.cor}
              mapSentido={mapSentido}
            />
          </section>
        )}

        {/* Footer with Reload Button */}
        <footer className="text-center text-sm text-muted-foreground py-6 space-y-3">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-medium transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Atualizar
            </button>
          </div>
          <p>Horários sujeitos a alterações</p>
        </footer>
      </main>
    </div>
  );
};
