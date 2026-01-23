import { fetchDollarRates } from '@/services/dolarService';
import { fetchHistoricalRates } from '@/services/historyService';
import { DolarRate, HistoricalRate } from '@/types';
import HomeClient from './HomeClient';

// Revalidate every 60 seconds for fresh data
export const revalidate = 60;

export default async function Home() {
  // Server-side data fetching
  const [rates, historicalData] = await Promise.all([
    fetchDollarRates(),
    fetchHistoricalRates()
  ]);

  // Sort rates by priority
  const order = ['blue', 'oficial', 'bolsa', 'contadoconliqui', 'cripto', 'tarjeta'];
  const prioritizedRates = [...rates].sort((a, b) => {
    const indexA = order.indexOf(a.casa);
    const indexB = order.indexOf(b.casa);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });

  return (
    <HomeClient 
      initialRates={prioritizedRates} 
      initialHistoricalData={historicalData} 
    />
  );
}

