import { HistoricalRate } from '@/types';

export const fetchHistoricalRates = async (): Promise<HistoricalRate[]> => {
  try {
    const response = await fetch('https://api.argentinadatos.com/v1/cotizaciones/dolares/blue', {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!response.ok) {
      throw new Error('Error fetching history');
    }
    
    const data = await response.json();
    const sortedData = data.sort((a: HistoricalRate, b: HistoricalRate) => 
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );
    
    return sortedData.slice(-30);
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return [];
  }
};
