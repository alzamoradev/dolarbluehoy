'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { DolarRate, MarketInsight } from '@/types';

export const analyzeMarket = async (rates: DolarRate[]): Promise<MarketInsight> => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("GEMINI_API_KEY not configured");
    return {
      analysisDollar: "El análisis no está disponible.",
      analysisPeso: "Configurá la variable GEMINI_API_KEY en Vercel.",
      disclaimer: "Sin API key configurada.",
      sources: []
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const blue = rates.find(r => r.casa === 'blue');
  const oficial = rates.find(r => r.casa === 'oficial');
  const mep = rates.find(r => r.casa === 'bolsa');
  const ccl = rates.find(r => r.casa === 'contadoconliqui');
  const brecha = blue && oficial ? ((blue.venta / oficial.venta - 1) * 100).toFixed(1) : 'N/A';

  const prompt = `Sos un analista financiero argentino que habla con lenguaje coloquial argentino (usá "vos", "tenés", "podés", etc.). 

Datos actuales del mercado:
- Dólar Blue: $${blue?.venta || 'N/A'}
- Dólar Oficial: $${oficial?.venta || 'N/A'}  
- Dólar MEP: $${mep?.venta || 'N/A'}
- Dólar CCL: $${ccl?.venta || 'N/A'}
- Brecha Blue/Oficial: ${brecha}%

Generá un análisis BREVE (2 oraciones máximo cada uno) usando expresiones argentinas naturales como:
- "el dólar está planchado"
- "conviene hacer carry trade"
- "la brecha está achicándose/agrandándose"
- "el blue se está calentando"
- "las tasas siguen siendo atractivas"

1. "analysisDollar": Razones para dolarizarse (cobertura, riesgo de devaluación). Máx 2 oraciones.
2. "analysisPeso": Razones para quedarse en pesos/carry trade. Máx 2 oraciones.
3. "disclaimer": "Esto no es asesoramiento financiero. Consultá con un profesional antes de invertir."

IMPORTANTE: Respondé SOLO con JSON válido, sin markdown, sin backticks, sin explicaciones:
{"analysisDollar": "...", "analysisPeso": "...", "disclaimer": "..."}`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 500,
      }
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Debug log only in development
    if (process.env.NODE_ENV === 'development') {
      console.log("Gemini raw response:", text);
    }
    
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
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      analysisDollar: `Error: ${errorMessage}`,
      analysisPeso: "No se pudo completar el análisis.",
      disclaimer: "Intentá de nuevo más tarde.",
      sources: []
    };
  }
};
