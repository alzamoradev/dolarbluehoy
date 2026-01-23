import { GoogleGenAI, Type } from "@google/genai";
import { DolarRate, MarketInsight } from '../types';

export const analyzeMarket = async (rates: DolarRate[]): Promise<MarketInsight> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const blue = rates.find(r => r.casa === 'blue');
  const oficial = rates.find(r => r.casa === 'oficial');
  const mep = rates.find(r => r.casa === 'mep');
  const ccl = rates.find(r => r.casa === 'contadoconliqui');

  const prompt = `
    Actúa como un analista financiero objetivo y prudente en Argentina.
    
    Datos actuales del mercado:
    Blue: $${blue?.venta}
    Oficial: $${oficial?.venta}
    MEP: $${mep?.venta}
    CCL: $${ccl?.venta}
    
    Tarea:
    1. Busca en Google noticias financieras recientes sobre el dólar en Argentina, expectativas de devaluación y tasas de interés generales (referencia).
       
    2. Genera un reporte comparativo con dos escenarios:
       - Escenario Dólar: Argumentos para quienes prefieren dolarizarse (cobertura, riesgos de devaluación, brecha).
       - Escenario Peso (Carry Trade): Argumentos para quienes apuestan a la tasa en pesos (aprovechando estabilidad cambiaria momentánea).

    3. Reglas CRÍTICAS:
       - NO incluyas una sección específica de tasas numéricas. Integra el razonamiento en los escenarios.
       - NO des consejos de inversión directos (ej: "Compra ahora"). Solo presenta los hechos y las perspectivas.
       - Incluye un disclaimer legal fuerte.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysisDollar: { 
              type: Type.STRING, 
              description: "Argumentos a favor de la dolarización (Escenario Alcista/Cobertura). Máx 2 oraciones." 
            },
            analysisPeso: { 
              type: Type.STRING, 
              description: "Argumentos a favor del Carry Trade/Peso (Escenario Tasa). Máx 2 oraciones." 
            },
            disclaimer: { 
              type: Type.STRING, 
              description: "Aviso legal explícito de que esto no es consejo financiero y conlleva riesgo." 
            }
          },
          required: ["analysisDollar", "analysisPeso", "disclaimer"]
        }
      }
    });

    const jsonText = response.text;
    
    // Extract sources
    const sources: string[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          sources.push(chunk.web.uri);
        }
      });
    }

    if (!jsonText) throw new Error("No data returned");
    
    const data = JSON.parse(jsonText) as MarketInsight;
    data.sources = [...new Set(sources)].slice(0, 3);
    
    return data;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      analysisDollar: "No se pudieron obtener datos actualizados.",
      analysisPeso: "No se pudieron obtener datos actualizados.",
      disclaimer: "Error de conexión. La información presentada puede estar desactualizada. No opere basándose en esto.",
      sources: []
    };
  }
};