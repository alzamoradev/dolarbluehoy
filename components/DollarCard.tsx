import { DolarRate } from '@/types';
import { Win98Panel } from './RetroUI';

interface Props {
  rate: DolarRate;
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
      </div>
      <Win98Panel className="bg-white flex justify-between items-center px-2 py-2">
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
      </Win98Panel>
      <div className="text-[10px] text-right text-gray-600 font-retro">
        <time dateTime={rate.fechaActualizacion}>Act: {formattedDate}hs</time>
      </div>
    </article>
  );
};
