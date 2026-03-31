import trecturLogo from '@/assets/trectur-logo.png';
import { Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header = () => {
  return (
    <header className="border-b border-border bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={trecturLogo} 
              alt="Trectur - Transporte Urbano" 
              className="h-12 md:h-16 w-auto"
            />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Horário de Ônibus
              </h1>
              <p className="text-sm text-gray-600 font-medium">
                Transporte Urbano • Três Corações/MG
              </p>
            </div>
          </div>
          <Link 
            to="/instalar"
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Instalar App</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
