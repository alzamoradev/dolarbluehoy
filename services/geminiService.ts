'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { DolarRate, MarketInsight } from '@/types';

export const analyzeMarket = async (rates: DolarRate[]): Promise<MarketInsight> => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return {
      analysisDollar: "API key no configurada.",
      analysisPeso: "API key no configurada.",
      disclaimer: "Configure GEMINI_API_KEY para habilitar el análisis.",
      sources: []
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const blue = rates.find(r => r.casa === 'blue');
  const oficial = rates.find(r => r.casa === 'oficial');
  const mep = rates.find(r => r.casa === 'bolsa');
  const ccl = rates.find(r => r.casa === 'contadoconliqui');

  const prompt = `
    Actúa como un analista financiero objetivo y prudente en Argentina.
    
    Datos actuales del mercado:
    Blue: $${blue?.venta}
    Oficial: $${oficial?.venta}
    MEP: $${mep?.venta}
    CCL: $${ccl?.venta}
    
    Tarea:
    1. Genera un reporte comparativo con dos escenarios:
       - Escenario Dólar: Argumentos para quienes prefieren dolarizarse (cobertura, riesgos de devaluación, brecha). Máx 2 oraciones.
       - Escenario Peso (Carry Trade): Argumentos para quienes apuestan a la tasa en pesos. Máx 2 oraciones.

    2. Reglas CRÍTICAS:
       - NO des consejos de inversión directos.
       - Incluye un disclaimer legal.
    
    Responde en formato JSON con las keys: analysisDollar, analysisPeso, disclaimer
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]) as MarketInsight;
      data.sources = [];
      return data;
    }
    
    throw new Error("Could not parse response");

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      analysisDollar: "No se pudieron obtener datos actualizados.",
      analysisPeso: "No se pudieron obtener datos actualizados.",
      disclaimer: "Error de conexión. La información puede estar desactualizada.",
      sources: []
    };
  }
};
