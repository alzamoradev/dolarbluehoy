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

// Fetch rate from ~24 hours ago for a specific dollar type
async function fetch24hAgoRate(casa: string): Promise<number | null> {
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
    
    // Sort by date descending (most recent first)
    const sorted = data.sort((a: { fecha: string }, b: { fecha: string }) => 
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
    
    // Calculate date from 24 hours ago
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const targetDateStr = twentyFourHoursAgo.toISOString().split('T')[0];
    
    // Find the rate from 24h ago, or the closest previous one
    const rate24hAgo = sorted.find((r: { fecha: string }) => r.fecha <= targetDateStr);
    
    return rate24hAgo?.venta || null;
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
    
    // Fetch rates from 24h ago in parallel for all types
    const ratesWithVariation = await Promise.all(
      data.map(async (rate) => {
        const rate24hAgo = await fetch24hAgoRate(rate.casa);
        let variacion: number | undefined;
        
        if (rate24hAgo && rate24hAgo > 0) {
          variacion = ((rate.venta - rate24hAgo) / rate24hAgo) * 100;
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
