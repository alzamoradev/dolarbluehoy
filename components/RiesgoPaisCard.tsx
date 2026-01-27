'use client';

import { RiesgoPais } from '@/types';
import { Win98Window, Win98Panel } from './RetroUI';

interface Props {
  riesgoPais: RiesgoPais | null;
}

const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M1 14h14v1H1v-1zm2-4h2v3H3v-3zm4-3h2v6H7V7zm4-4h2v10h-2V3z" />
  </svg>
);

export const RiesgoPaisCard: React.FC<Props> = ({ riesgoPais }) => {
  // Fallback when data is not available
  if (!riesgoPais) {
    return (
      <Win98Window 
        title="Riesgo País Argentina" 
        icon={<ChartIcon />}
        className="w-full"
      >
        <div className="bg-win-gray p-4">
          <Win98Panel className="bg-white p-4">
            <div className="text-center text-gray-500 font-retro">
              <p className="text-sm">⚠️ No disponible</p>
              <p className="text-xs mt-1">Intente más tarde</p>
            </div>
          </Win98Panel>
        </div>
      </Win98Window>
    );
  }

  // Determine colors based on trend
  // For risk: down is GOOD (green), up is BAD (red)
  const getTrendColor = () => {
    if (riesgoPais.tendencia === 'down') return 'text-green-600';
    if (riesgoPais.tendencia === 'up') return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = () => {
    if (riesgoPais.tendencia === 'down') return '▼';
    if (riesgoPais.tendencia === 'up') return '▲';
    return '●';
  };

  const getTrendBg = () => {
    if (riesgoPais.tendencia === 'down') return 'bg-green-100 border-green-400';
    if (riesgoPais.tendencia === 'up') return 'bg-red-100 border-red-400';
    return 'bg-gray-100 border-gray-400';
  };

  return (
    <Win98Window 
      title="Riesgo País Argentina" 
      icon={<ChartIcon />}
      className="w-full"
      titleAs="h2"
    >
      <div className="bg-win-gray p-3">
        <Win98Panel className="bg-white p-3">
          <div className="flex flex-col items-center gap-2">
            {/* Main Value */}
            <div className="text-center">
              <span className="text-4xl font-bold font-retro text-win-blue">
                {riesgoPais.valor.toLocaleString('es-AR')}
              </span>
              <span className="text-sm font-retro text-gray-500 ml-1">puntos</span>
            </div>

            {/* Variation Badge */}
            <div className={`px-3 py-1 rounded border ${getTrendBg()} flex items-center gap-1`}>
              <span className={`font-bold ${getTrendColor()}`}>
                {getTrendIcon()}
              </span>
              <span className={`font-retro text-sm font-bold ${getTrendColor()}`}>
                {riesgoPais.variacion}
              </span>
            </div>

            {/* Divider */}
            <div className="w-full h-[1px] bg-gray-300 my-1"></div>

            {/* Info Footer */}
            <div className="text-center">
              <p className="text-xs text-gray-500 font-retro">
                EMBI+ (JP Morgan)
              </p>
              <p className="text-[10px] text-gray-400 font-retro">
                Actualizado: {riesgoPais.fecha}
              </p>
            </div>
          </div>
        </Win98Panel>

        {/* Educational Info */}
        <div className="mt-2 p-2 bg-[#FFFFE1] border border-gray-400 text-xs font-retro text-gray-700">
          <p className="font-bold text-gray-800 mb-1">💡 ¿Qué es el Riesgo País?</p>
          <p className="leading-tight">
            El índice EMBI+ mide la diferencia entre los bonos argentinos y los del Tesoro de EE.UU. 
            A menor valor, más confianza en la economía.
          </p>
        </div>
      </div>
    </Win98Window>
  );
};
