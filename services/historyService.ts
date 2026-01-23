import { HistoricalRate } from '../types';

export const fetchHistoricalRates = async (): Promise<HistoricalRate[]> => {
  try {
    // API from enzonotario/esjs-argentina-datos-api
    const response = await fetch('https://api.argentinadatos.com/v1/cotizaciones/dolares/blue');
    if (!response.ok) {
      throw new Error('Error fetching history');
    }
    const data = await response.json();
    
    // The API returns a large dataset. We take the last 30 days for the chart.
    // Ensure we sort by date just in case
    const sortedData = data.sort((a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    
    return sortedData.slice(-30);
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return [];
  }
};