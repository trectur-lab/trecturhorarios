import { ChevronDown, Calendar, MapPin } from 'lucide-react';

interface BusLineBasic {
  id: number;
  numero: string;
  nome: string;
  cor: string;
  directions: string[];
}

interface SelectorsProps {
  lines: BusLineBasic[];
  selectedLine: number;
  selectedDirection: string;
  selectedDate: string;
  selectedLinha: BusLineBasic | undefined;
  onLineChange: (lineId: number) => void;
  onDirectionChange: (direction: string) => void;
  onDateChange: (date: string) => void;
}

export const Selectors = ({
  lines,
  selectedLine,
  selectedDirection,
  selectedDate,
  selectedLinha,
  onLineChange,
  onDirectionChange,
  onDateChange,
}: SelectorsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Line Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: selectedLinha?.cor || '#e74c3c' }} 
          />
          Linha
        </label>
        <div className="relative">
          <select
            value={selectedLine}
            onChange={(e) => onLineChange(Number(e.target.value))}
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none pr-10 transition-all hover:bg-secondary/80"
          >
            {lines.map(linha => (
              <option key={linha.id} value={linha.id}>
                {linha.numero} - {linha.nome}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" size={20} />
        </div>
      </div>

      {/* Direction Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <MapPin size={14} />
          Ponto Inicial / Partida
        </label>
        <div className="relative">
          <select
            value={selectedDirection}
            onChange={(e) => onDirectionChange(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none pr-10 transition-all hover:bg-secondary/80"
          >
            {selectedLinha?.directions?.map(dir => (
              <option key={dir} value={dir}>{dir}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" size={20} />
        </div>
      </div>

      {/* Date Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Calendar size={14} />
          Data
        </label>
        <div className="relative">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all hover:bg-secondary/80"
          />
        </div>
      </div>
    </div>
  );
};
