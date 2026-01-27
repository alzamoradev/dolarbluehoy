export interface RiesgoPais {
  valor: number;
  fecha: string;
  variacion: string;
  tendencia: 'up' | 'down' | 'neutral';
}

/**
 * Fetches Argentina's country risk (Riesgo País) from Ámbito's internal API.
 * 
 * Rate limiting considerations:
 * - Cache for 10 minutes (revalidate: 600) to avoid excessive requests
 * - Uses a realistic User-Agent header
 * - Returns null gracefully on errors (fallback handling)
 */
export async function fetchRiesgoPais(): Promise<RiesgoPais | null> {
  try {
    const response = await fetch(
      'https://mercados.ambito.com/riesgopais/variacion-ultimo',
      {
        next: { revalidate: 600 }, // Cache for 10 minutes to be respectful
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    );

    if (!response.ok) {
      console.error('Riesgo país API returned non-OK status:', response.status);
      return null;
    }

    const data = await response.json();
    
    // API response format:
    // {"ultimo":"501","fecha":"27-01-2026","variacion":"-2,34%","class-variacion":"down-green"}
    
    if (!data || !data.ultimo) {
      console.error('Invalid riesgo país data format:', data);
      return null;
    }

    // Determine trend from class-variacion
    let tendencia: 'up' | 'down' | 'neutral' = 'neutral';
    if (data['class-variacion']?.includes('down')) {
      tendencia = 'down'; // down means the value went down (good for risk)
    } else if (data['class-variacion']?.includes('up')) {
      tendencia = 'up'; // up means the value went up (bad for risk)
    }

    return {
      valor: parseInt(data.ultimo, 10),
      fecha: data.fecha,
      variacion: data.variacion || '0%',
      tendencia
    };
  } catch (error) {
    console.error('Error fetching riesgo país:', error);
    return null;
  }
}
