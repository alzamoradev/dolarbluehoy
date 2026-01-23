'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { DolarRate, MarketInsight } from '@/types';

export const analyzeMarket = async (rates: DolarRate[]): Promise<MarketInsight> => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("GEMINI_API_KEY not configured");
    return {
      analysisDollar: "El análisis de IA no está disponible.",
      analysisPeso: "Configure la variable GEMINI_API_KEY en Vercel.",
      disclaimer: "Sin API key configurada.",
      sources: []
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const blue = rates.find(r => r.casa === 'blue');
  const oficial = rates.find(r => r.casa === 'oficial');
  const mep = rates.find(r => r.casa === 'bolsa');
  const ccl = rates.find(r => r.casa === 'contadoconliqui');

  const prompt = `Sos un analista financiero argentino objetivo. Datos actuales:
- Dólar Blue: $${blue?.venta || 'N/A'}
- Dólar Oficial: $${oficial?.venta || 'N/A'}  
- Dólar MEP: $${mep?.venta || 'N/A'}
- Dólar CCL: $${ccl?.venta || 'N/A'}
- Brecha Blue/Oficial: ${blue && oficial ? ((blue.venta / oficial.venta - 1) * 100).toFixed(1) : 'N/A'}%

Generá un análisis BREVE (2 oraciones máximo cada uno):
1. "analysisDollar": Argumentos para dolarizarse (riesgos de devaluación, cobertura)
2. "analysisPeso": Argumentos para carry trade en pesos (tasa vs inflación)
3. "disclaimer": Aviso legal breve

Respondé SOLO en JSON válido, sin markdown ni explicaciones adicionales:
{"analysisDollar": "...", "analysisPeso": "...", "disclaimer": "..."}`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-latest",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Gemini raw response:", text);
    
    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[0]) as MarketInsight;
        data.sources = [];
        return data;
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Invalid JSON in response");
      }
    }
    
    throw new Error("No JSON found in response");

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    
    // Return a more descriptive error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      analysisDollar: `Error: ${errorMessage}`,
      analysisPeso: "No se pudo completar el análisis.",
      disclaimer: "Intente nuevamente más tarde. Si el error persiste, verifique la configuración de la API.",
      sources: []
    };
  }
};
