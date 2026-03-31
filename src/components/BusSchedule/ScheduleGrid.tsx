import { useState } from 'react';
import { Clock, Info, X } from 'lucide-react';

interface ScheduleItem {
  hora: string;
  obs: string;
}

interface ScheduleGridProps {
  schedule: ScheduleItem[];
  nextBusIndex: number | null;
  dayType: string;
  lineColor: string;
}

const dayTypeLabels: Record<string, string> = {
  uteis: 'Dias Úteis',
  sabados: 'Sábados',
  domingos: 'Domingos e Feriados',
};

export const ScheduleGrid = ({ schedule, nextBusIndex, dayType, lineColor }: ScheduleGridProps) => {
  const [activeObsIndex, setActiveObsIndex] = useState<number | null>(null);

  if (schedule.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-8 border border-border">
        <div className="text-center text-muted-foreground">
          <Clock size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Sem horários disponíveis</p>
          <p className="text-sm mt-1">para este dia e sentido</p>
        </div>
      </div>
    );
  }

  const handleObsClick = (index: number) => {
    setActiveObsIndex(activeObsIndex === index ? null : index);
  };

  const closeObs = () => {
    setActiveObsIndex(null);
  };

  return (
    <>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-2 h-8 rounded-full" 
              style={{ backgroundColor: lineColor }} 
            />
            <div>
              <h3 className="font-semibold text-lg">{dayTypeLabels[dayType]}</h3>
              <p className="text-sm text-muted-foreground">{schedule.length} horários</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {schedule.map((item, index) => {
              const isNext = index === nextBusIndex;
              const isPast = nextBusIndex !== null && index < nextBusIndex;
              
              return (
                <div
                  key={`${item.hora}-${index}`}
                  className={`
                    relative group rounded-xl p-3 transition-all duration-200 border
                    ${isNext 
                      ? 'bg-primary text-primary-foreground border-primary shadow-glow scale-105' 
                      : isPast 
                        ? 'bg-muted/50 text-muted-foreground border-transparent opacity-60' 
                        : 'bg-secondary hover:bg-secondary/80 border-border hover:border-primary/30'
                    }
                  `}
                  style={isNext ? { borderColor: lineColor, boxShadow: `0 0 20px ${lineColor}40` } : {}}
                >
                  <div className="font-mono text-lg font-bold text-center">
                    {item.hora}
                  </div>
                  
                  {item.obs && (
                    <button
                      onClick={() => handleObsClick(index)}
                      className="absolute -top-1 -right-1 p-1"
                      aria-label="Ver observação"
                    >
                      <Info 
                        size={14} 
                        className={`${isNext ? 'text-primary-foreground/80' : 'text-muted-foreground'} cursor-pointer`} 
                      />
                    </button>
                  )}
                  
                  {isNext && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-white/20 rounded-full">
                        Próximo
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {activeObsIndex !== null && schedule[activeObsIndex]?.obs && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
          onClick={closeObs}
        >
          <div 
            className="bg-red-600 border-2 border-red-800 rounded-xl p-6 mx-4 max-w-sm shadow-2xl text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeObs}
              className="absolute top-2 right-2 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Fechar"
            >
              <X size={16} className="text-white" />
            </button>
            <p className="text-base text-white font-medium pr-6">{schedule[activeObsIndex].obs}</p>
            <button
              onClick={closeObs}
              className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
