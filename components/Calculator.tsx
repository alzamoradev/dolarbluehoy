import React, { useState, useMemo } from 'react';
import { DolarRate } from '../types';
import { Win98Window, Win98Panel, Win98Button } from './RetroUI';

interface Props {
  rates: DolarRate[];
}

const CalcIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2 1h12v14H2V1zm1 1v12h10V2H3zm2 2h2v2H5V4zm4 0h2v2H9V4zm-4 4h2v2H5V8zm4 0h2v2H9V8zm-4 4h2v2H5v-2zm4 0h2v2H9v-2z" />
  </svg>
);

export const Calculator: React.FC<Props> = ({ rates }) => {
  const [amount, setAmount] = useState<number>(100);
  const [selectedCasa, setSelectedCasa] = useState<string>('blue');

  const selectedRate = rates.find(r => r.casa === selectedCasa) || rates.find(r => r.casa === 'blue');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);
  };

  // SEO Strategy: Amounts selected based on High Volume/Medium KD keywords
  const seoAmounts = [
    50, 100, 
    150, // Vol: 5400
    200, // Vol: 14800 (Top Tier)
    250, // Vol: 5400
    300, // Vol: 18100 (Top Tier)
    350, // Vol: 3600
    400,
    450, // Vol: 4400
    500,
    600,
    700, // Vol: 4400
    800, // Vol: 1900
    1000,
    1500, // Vol: 1900
    2000, 
    2500, // Vol: 1900
    3000,
    4000, // Vol: 1900 (Specific high intent)
    5000, // Vol: 1600
    10000, // Vol: 3600 ("10 mil")
    20000, // Vol: 1900
    50000, // Vol: 1600 ("50 mil")
    100000, // Vol: 1600 ("100 mil")
    500000, // Vol: 1300
    1000000 // Vol: 1900 ("1 millon")
  ];

  return (
    <Win98Window 
      title="Calculadora Dólar a Pesos" 
      icon={<CalcIcon />}
      className="w-full mt-6"
    >
      <div className="bg-win-gray p-2 font-sans text-sm">
        <form onSubmit={handleCalculate} className="flex flex-col gap-3">
            <div className="flex gap-2 items-center">
                <label className="font-retro w-20 text-black">Monto USD:</label>
                <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full border-2 border-gray-400 p-1 font-retro text-lg shadow-inner text-black bg-white"
                />
            </div>
            <div className="flex gap-2 items-center">
                <label className="font-retro w-20 text-black">Tipo:</label>
                <select 
                    value={selectedCasa} 
                    onChange={(e) => setSelectedCasa(e.target.value)}
                    className="w-full border-2 border-gray-400 p-1 font-retro shadow-inner bg-white text-black"
                >
                    {rates.map(r => (
                        <option key={r.casa} value={r.casa} className="text-black">
                            {r.nombre}
                        </option>
                    ))}
                </select>
            </div>

            <Win98Panel className="bg-white p-2 mt-2">
                <div className="flex flex-col gap-1 text-center">
                    <span className="text-gray-500 text-xs font-retro uppercase">Si vendés tus dólares (Recibís pesos)</span>
                    <span className="text-2xl font-bold font-retro text-win-teal">
                        {selectedRate ? formatCurrency(amount * selectedRate.compra) : '-'}
                    </span>
                    <div className="h-[1px] bg-gray-300 w-full my-1"></div>
                    <span className="text-gray-500 text-xs font-retro uppercase">Si comprás dólares (Pagás pesos)</span>
                    <span className="text-xl font-bold font-retro text-win-blue">
                        {selectedRate ? formatCurrency(amount * selectedRate.venta) : '-'}
                    </span>
                </div>
            </Win98Panel>
        </form>

        {/* SEO Content Section: "Cheat Sheet" for keywords */}
        <div className="mt-4 border-t-2 border-white pt-2">
            <h3 className="font-bold font-retro mb-2 text-win-blue">Tabla de Conversión ({selectedRate?.nombre})</h3>
            <div className="bg-white border-2 border-gray-400 p-1 shadow-inner h-48 overflow-y-auto">
                <table className="w-full text-xs font-retro text-black">
                    <thead>
                        <tr className="border-b border-gray-300">
                            <th className="text-left pl-1 pb-1">Dólares</th>
                            <th className="text-right pr-1 pb-1">Pesos (Venta)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {seoAmounts.map(val => (
                            <tr key={val} className="even:bg-gray-100 text-black hover:bg-win-blue hover:text-white cursor-default">
                                <td className="pl-1 py-0.5 font-bold">{val.toLocaleString('es-AR')} USD</td>
                                <td className="text-right pr-1 py-0.5">
                                    {selectedRate ? formatCurrency(val * selectedRate.venta) : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                Valores calculados al día de la fecha con la cotización de venta del {selectedRate?.nombre}. Ideal para viajeros y ahorro.
            </p>
        </div>
      </div>
    </Win98Window>
  );
};