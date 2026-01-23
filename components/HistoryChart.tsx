import React from 'react';
import { HistoricalRate } from '../types';

interface Props {
  data: HistoricalRate[];
}

export const HistoryChart: React.FC<Props> = ({ data }) => {
  if (data.length === 0) return <div className="text-white font-retro">Sin datos disponibles.</div>;

  // Increased width and padding to fit labels
  const width = 320; 
  const height = 160;
  const paddingX = 10;
  const paddingY = 20;
  const rightGutter = 50; // Extra space on the right for price labels

  // Find min/max for scaling
  const prices = data.map(d => d.venta);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  // Create points for SVG path
  // Draw area width is total width - padding - rightGutter
  const drawWidth = width - paddingX - rightGutter;
  const drawHeight = height - (paddingY * 2);

  const points = data.map((d, index) => {
    const x = (index / (data.length - 1)) * drawWidth + paddingX;
    // Normalize Y
    const range = maxPrice - minPrice || 1;
    const normalizedY = (d.venta - minPrice) / range;
    const y = (height - paddingY) - (normalizedY * drawHeight);
    return `${x},${y}`;
  }).join(' ');

  const startDate = new Date(data[0].fecha).toLocaleDateString('es-AR', {day: '2-digit', month: '2-digit'});
  const endDate = new Date(data[data.length - 1].fecha).toLocaleDateString('es-AR', {day: '2-digit', month: '2-digit'});

  return (
    <div className="flex flex-col items-center bg-black border-2 border-gray-600 p-2 shadow-inner w-full">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="bg-black overflow-visible">
        {/* Grid lines */}
        <line x1={paddingX} y1={paddingY} x2={paddingX} y2={height - paddingY} stroke="#333" strokeWidth="1" />
        <line x1={paddingX} y1={height - paddingY} x2={width - rightGutter} y2={height - paddingY} stroke="#333" strokeWidth="1" />
        <line x1={paddingX} y1={paddingY} x2={width - rightGutter} y2={paddingY} stroke="#333" strokeWidth="1" strokeDasharray="4" />
        
        {/* The Line */}
        <polyline 
          points={points} 
          fill="none" 
          stroke="#00FF00" 
          strokeWidth="2" 
          vectorEffect="non-scaling-stroke"
        />

        {/* Min/Max Labels - Aligned to End to prevent cutoff */}
        <text x={width - 5} y={paddingY + 5} fill="#00FF00" fontSize="12" fontFamily="monospace" textAnchor="end">${maxPrice}</text>
        <text x={width - 5} y={height - paddingY} fill="#00FF00" fontSize="12" fontFamily="monospace" textAnchor="end">${minPrice}</text>
      </svg>
      <div className="flex justify-between w-full text-[#00FF00] font-retro text-xs mt-1 px-2">
        <span>{startDate}</span>
        <span>Últimos 30 días</span>
        <span>{endDate}</span>
      </div>
    </div>
  );
};