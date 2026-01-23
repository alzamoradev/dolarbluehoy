import { DolarRateWithVariation } from '@/services/dolarService';
import { Win98Panel } from './RetroUI';

interface Props {
  rate: DolarRateWithVariation;
}

const nameMap: Record<string, string> = {
  'oficial': 'Dólar Oficial',
  'blue': 'Dólar Blue',
  'bolsa': 'Dólar MEP',
  'contadoconliqui': 'Dólar CCL',
  'tarjeta': 'Dólar Tarjeta',
  'mayorista': 'Dólar Mayorista',
  'cripto': 'Dólar Cripto',
};

export function getDollarDisplayName(casa: string, nombre: string): string {
  return nameMap[casa] || nombre;
}

export const DollarCard: React.FC<Props> = ({ rate }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);
  };

  const baseName = getDollarDisplayName(rate.casa, rate.nombre);
  const displayName = `Valor ${baseName} Hoy`;
  
  // Check if it's "tarjeta" - only show venta
  const isTarjeta = rate.casa === 'tarjeta';

  // Format variation
  const hasVariation = rate.variacion !== undefined && !isNaN(rate.variacion);
  const variationValue = hasVariation ? rate.variacion!.toFixed(2) : null;
  const isPositive = hasVariation && rate.variacion! > 0;
  const isNegative = hasVariation && rate.variacion! < 0;
  const isNeutral = hasVariation && rate.variacion === 0;

  const formattedDate = new Date(rate.fechaActualizacion).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <article className="flex flex-col gap-1 w-full min-w-0" itemScope itemType="https://schema.org/FinancialProduct">
      <meta itemProp="name" content={baseName} />
      <div className="flex items-center gap-2 mb-1 text-black">
        <h2 className="font-bold font-retro uppercase text-lg pl-1 truncate" itemProp="description">{displayName}</h2>
        {/* Variation Badge */}
        {hasVariation && (
          <span 
            className={`text-xs font-bold px-2 py-0.5 rounded-sm border ${
              isPositive 
                ? 'bg-green-100 text-green-700 border-green-400' 
                : isNegative 
                  ? 'bg-red-100 text-red-700 border-red-400'
                  : 'bg-gray-100 text-gray-600 border-gray-400'
            }`}
          >
            {isPositive && '▲'}
            {isNegative && '▼'}
            {isNeutral && '—'}
            {' '}{isPositive ? '+' : ''}{variationValue}%
          </span>
        )}
      </div>
      <Win98Panel className="bg-white flex justify-between items-center px-2 py-2">
        {isTarjeta ? (
          // Tarjeta: Solo venta (no se puede comprar)
          <div className="text-center w-full px-1">
            <div className="text-[10px] text-gray-500 font-retro uppercase tracking-tighter">Venta (no se puede comprar)</div>
            <div className="text-xl font-bold font-retro text-win-blue leading-none">{formatCurrency(rate.venta)}</div>
          </div>
        ) : (
          // Otros dólares: Compra y Venta
          <>
            <div className="text-center w-1/2 border-r-2 border-gray-300 border-dotted px-1">
              <div className="text-[10px] text-gray-500 font-retro uppercase tracking-tighter">Compra</div>
              <div className="text-lg font-bold font-retro text-win-teal leading-none" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                <meta itemProp="priceCurrency" content="ARS" />
                <span itemProp="price">{formatCurrency(rate.compra)}</span>
              </div>
            </div>
            <div className="text-center w-1/2 px-1">
              <div className="text-[10px] text-gray-500 font-retro uppercase tracking-tighter">Venta</div>
              <div className="text-lg font-bold font-retro text-win-blue leading-none">{formatCurrency(rate.venta)}</div>
            </div>
          </>
        )}
      </Win98Panel>
      <div className="text-[10px] text-right text-gray-600 font-retro">
        <time dateTime={rate.fechaActualizacion}>Act: {formattedDate}hs</time>
      </div>
    </article>
  );
};
