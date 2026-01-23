import { DolarRate } from '@/types';

// Map dolarapi casa names to argentinadatos endpoints
const argentinaDataMap: Record<string, string> = {
  'blue': 'blue',
  'oficial': 'oficial',
  'bolsa': 'bolsa',
  'contadoconliqui': 'contadoconliqui',
  'tarjeta': 'tarjeta',
  'cripto': 'cripto',
  'mayorista': 'mayorista',
};

// Fetch yesterday's rate for a specific dollar type
async function fetchYesterdayRate(casa: string): Promise<number | null> {
  const endpoint = argentinaDataMap[casa];
  if (!endpoint) return null;
  
  try {
    const response = await fetch(
      `https://api.argentinadatos.com/v1/cotizaciones/dolares/${endpoint}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data || data.length < 2) return null;
    
    // Sort by date descending and get yesterday's (second to last)
    const sorted = data.sort((a: { fecha: string }, b: { fecha: string }) => 
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
    
    // Get the previous day's rate (index 1, since 0 is today/latest)
    const yesterday = sorted[1];
    return yesterday?.venta || null;
  } catch {
    return null;
  }
}

export interface DolarRateWithVariation extends DolarRate {
  variacion?: number; // Percentage variation from yesterday
}

export const fetchDollarRates = async (): Promise<DolarRateWithVariation[]> => {
  try {
    const response = await fetch('https://dolarapi.com/v1/dolares', {
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    
    if (!response.ok) {
      throw new Error('Error fetching rates');
    }
    
    const data: DolarRate[] = await response.json();
    
    // Fetch yesterday's rates in parallel for all types
    const ratesWithVariation = await Promise.all(
      data.map(async (rate) => {
        const yesterdayRate = await fetchYesterdayRate(rate.casa);
        let variacion: number | undefined;
        
        if (yesterdayRate && yesterdayRate > 0) {
          variacion = ((rate.venta - yesterdayRate) / yesterdayRate) * 100;
        }
        
        return {
          ...rate,
          variacion
        };
      })
    );
    
    return ratesWithVariation;
  } catch (error) {
    console.error("Failed to fetch rates:", error);
    return [];
  }
};
