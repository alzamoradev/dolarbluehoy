import React from 'react';
import { DolarRate } from '../types';

interface SEOProps {
  rates: DolarRate[];
}

export const SEOHelmet: React.FC<SEOProps> = ({ rates }) => {
  const blueRate = rates.find(r => r.casa === 'blue');
  const updateTime = blueRate?.fechaActualizacion || new Date().toISOString();
  const blueSell = blueRate?.venta || 0;

  // Date formatting for dynamic answers (e.g., "viernes 24 de enero")
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  const todayString = new Date().toLocaleDateString('es-AR', dateOptions);

  // Generate dynamic FAQs for all available rates
  const rateQuestions = rates.map(rate => {
    const nameMap: Record<string, string> = {
        'oficial': 'Dólar Oficial',
        'blue': 'Dólar Blue',
        'bolsa': 'Dólar MEP',
        'contadoconliqui': 'Dólar CCL',
        'tarjeta': 'Dólar Tarjeta',
        'mayorista': 'Dólar Mayorista',
        'cripto': 'Dólar Cripto',
    };
    const displayName = nameMap[rate.casa] || rate.nombre;
    
    return {
      "@type": "Question",
      "name": `¿Cuál es el valor del ${displayName} hoy?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `El valor del ${displayName} hoy ${todayString} es de $${rate.venta} para la venta y $${rate.compra} para la compra.`
      }
    };
  });

  const staticQuestions = [
    {
      "@type": "Question",
      "name": "¿Qué es el carry trade?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El carry trade, conocido como 'bicicleta financiera', es una estrategia que consiste en vender dólares, invertir los pesos en instrumentos con tasa de interés (como Plazos Fijos o Lecaps) y luego recomprar divisas, buscando obtener una ganancia superior a la devaluación del período."
      }
    },
    {
        "@type": "Question",
        "name": "¿Qué es el Dólar Blue?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El Dólar Blue es la cotización del dólar estadounidense en el mercado paralelo o informal de Argentina."
        }
    }
  ];

  // FAQ Data for Schema
  const faqData = {
    "@type": "FAQPage",
    "mainEntity": [
      ...rateQuestions,
      ...staticQuestions
    ]
  };

  // Main Product/Exchange Rate Schema
  const productData = {
    "@type": "WebPage",
    "name": "Valor Dolar Blue Hoy - Argentina",
    "description": `Cotización del Dólar Blue en vivo hoy ${todayString}: Compra $${blueRate?.compra} - Venta $${blueSell}. Monitor de mercado cambiario estilo Windows 98.`,
    "mainEntity": {
      "@type": "ExchangeRateSpecification",
      "currency": "ARS",
      "currentExchangeRate": {
        "@type": "UnitPriceSpecification",
        "price": blueSell,
        "priceCurrency": "ARS",
        "referenceQuantity": {
            "@type": "QuantitativeValue",
            "value": "1",
            "unitCode": "USD"
        }
      },
      "dateModified": updateTime,
      "name": "Dolar Blue Argentina"
    },
    "publisher": {
        "@type": "Organization",
        "name": "ValorDolarBlue",
        "url": "https://valordolarblue.com.ar",
        "sameAs": ["https://x.com/DolarBlueDiario"]
    }
  };

  // Software App Schema for the Calculator Feature
  const appSchema = {
    "@type": "WebApplication",
    "name": "Calculadora Dolar Blue",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "featureList": "Conversión de dólar a pesos, Cotización en vivo, Gráficos históricos"
  };

  // Graph structure combines both
  const graphSchema = {
    "@context": "https://schema.org",
    "@graph": [
      productData,
      faqData,
      appSchema
    ]
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(graphSchema)}
    </script>
  );
};