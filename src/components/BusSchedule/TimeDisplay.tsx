import { Clock, Bus, Timer } from 'lucide-react';
import { ScheduleItem } from '@/data/busLines';

interface TimeDisplayProps {
  currentTime: Date;
  nextBus: (ScheduleItem & { index: number }) | null;
  timeToNext: { hours: number; minutes: number; totalMinutes: number } | null;
  lineColor: string;
}

export const TimeDisplay = ({ currentTime, nextBus, timeToNext, lineColor }: TimeDisplayProps) => {
  const formatTimeLeft = () => {
    if (!timeToNext) return null;
    if (timeToNext.totalMinutes <= 0) return 'Partindo agora!';
    if (timeToNext.hours > 0) {
      return `${timeToNext.hours}h ${timeToNext.minutes}min`;
    }
    return `${timeToNext.minutes} min`;
  };

  return (
    <div 
      className="rounded-2xl p-6 md:p-8 relative overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${lineColor}, ${lineColor}dd)` 
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-4 border-white/20" />
        <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full border-4 border-white/20" />
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Time - Smaller */}
        <div className="glass rounded-xl p-4 bg-black/20">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-white/80" size={16} />
            <span className="text-xs text-white/70 font-medium">Horário de Brasília</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white font-mono tracking-wider">
            {currentTime.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
          </div>
          <div className="text-xs text-white/60 mt-2 capitalize">
            {currentTime.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              day: 'numeric',
              month: 'long',
              timeZone: 'America/Sao_Paulo'
            })}
          </div>
        </div>

        {/* Next Bus Time */}
        <div className="glass rounded-xl p-4 bg-black/20">
          <div className="flex items-center gap-2 mb-2">
            <Bus className="text-white/80" size={16} />
            <span className="text-xs text-white/70 font-medium">Próximo Ônibus</span>
          </div>
          {nextBus ? (
            <>
              <div className="text-2xl md:text-3xl font-bold text-white font-mono tracking-wider">
                {nextBus.hora}
              </div>
              {nextBus.obs && (
                <div className="mt-2 px-2 py-1 bg-yellow-400/90 rounded-md">
                  <p className="text-xs font-semibold text-gray-900 line-clamp-2">{nextBus.obs}</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-white/60">
              <p className="text-lg">Sem mais ônibus</p>
              <p className="text-xs mt-1">para esta linha hoje</p>
            </div>
          )}
        </div>

        {/* Countdown - Bigger and Highlighted */}
        <div className="glass rounded-xl p-4 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 border-2 border-yellow-400/50">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="text-yellow-300" size={18} />
            <span className="text-xs text-yellow-200 font-semibold uppercase tracking-wide">Tempo Restante</span>
          </div>
          {nextBus && timeToNext ? (
            <>
              <div className="text-4xl md:text-5xl font-black text-yellow-300 font-mono tracking-wider drop-shadow-lg">
                {formatTimeLeft()}
              </div>
              {timeToNext.totalMinutes <= 10 && timeToNext.totalMinutes > 0 && (
                <span className="mt-3 inline-block px-3 py-1 bg-yellow-400 rounded-full text-xs font-bold text-black animate-pulse">
                  🚌 Chegando!
                </span>
              )}
              {timeToNext.totalMinutes <= 0 && (
                <span className="mt-3 inline-block px-3 py-1 bg-green-400 rounded-full text-xs font-bold text-black animate-bounce">
                  🚌 Partindo agora!
                </span>
              )}
            </>
          ) : (
            <div className="text-yellow-200/60">
              <p className="text-2xl font-bold">--:--</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
