import { Metadata } from 'next';
import { fetchDollarRates, DolarRateWithVariation } from '@/services/dolarService';
import { fetchHistoricalRates } from '@/services/historyService';
import { fetchRiesgoPais, RiesgoPais } from '@/services/riesgoPaisService';
import { getAllPostsMeta } from '@/services/blogService';
import { getDollarDisplayName } from '@/components/DollarCard';
import { DolarRate } from '@/types';
import HomeClient from './HomeClient';

// Revalidate every 60 seconds for fresh data
export const revalidate = 60;

// Dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
  const [rates, riesgoPais] = await Promise.all([
    fetchDollarRates(),
    fetchRiesgoPais()
  ]);
  
  const blueRate = rates.find(r => r.casa === 'blue');
  const oficialRate = rates.find(r => r.casa === 'oficial');
  const mepRate = rates.find(r => r.casa === 'bolsa');
  
  // Fecha para meta title: "30 de enero"
  const titleDateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
  const titleDate = new Date().toLocaleDateString('es-AR', titleDateOptions);
  
  // Fecha larga para description
  const longDateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const longDate = new Date().toLocaleDateString('es-AR', longDateOptions);
  
  // Meta title: "Dólar Blue $1475 | Oficial $1465 - Hoy 30 de enero | Argentina"
  const title = blueRate 
    ? `Dólar Blue $${blueRate.venta} | Oficial $${oficialRate?.venta} - Hoy ${titleDate} | Argentina`
    : 'Dólar Blue Hoy - Cotización en Tiempo Real Argentina';
  
  // Meta description: ~155 chars, sin valor numérico de riesgo país (cambia muy rápido)
  const description = blueRate
    ? `💵 Cotización ${longDate}: Dólar Blue $${blueRate.venta} | Oficial $${oficialRate?.venta} | MEP $${mepRate?.venta} | CCL | Cripto | Riesgo País en tiempo real. Calculadora y gráficos históricos.`
    : 'Cotización del Dólar Blue, Oficial, MEP, CCL y Cripto en Argentina. Valores actualizados de compra y venta.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: 'https://valordolarblue.ar/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Cotización Dólar Blue Argentina',
        },
      ],
    },
    twitter: {
      title,
      description,
      images: ['https://valordolarblue.ar/og-image.png'],
    },
  };
}

// Generate JSON-LD schemas
function generateJsonLd(rates: DolarRate[], riesgoPais: RiesgoPais | null) {
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const todayString = new Date().toLocaleDateString('es-AR', dateOptions);
  
  const blueRate = rates.find(r => r.casa === 'blue');
  const oficialRate = rates.find(r => r.casa === 'oficial');
  const mepRate = rates.find(r => r.casa === 'bolsa');

  // Generate FAQ questions for ALL dollar types with current prices
  const faqEntities = rates.map(rate => {
    const displayName = getDollarDisplayName(rate.casa, rate.nombre);
    return {
      "@type": "Question",
      "name": `¿Cuál es el valor del ${displayName} hoy?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `El valor del ${displayName} hoy ${todayString} es de $${rate.venta} para la venta y $${rate.compra} para la compra.`
      }
    };
  });

  // Dynamic Riesgo País FAQ
  const riesgoPaisFaq = riesgoPais ? [
    {
      "@type": "Question",
      "name": "¿Cuál es el Riesgo País de Argentina hoy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `El Riesgo País de Argentina hoy ${todayString} es de ${riesgoPais.valor} puntos, con una variación del ${riesgoPais.variacion}. Este índice EMBI+ es elaborado por JP Morgan y mide la diferencia entre los bonos argentinos y los del Tesoro de Estados Unidos.`
      }
    }
  ] : [];

  // Static FAQs
  const staticFaqs = [
    {
      "@type": "Question",
      "name": "¿Qué es el Dólar Blue?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El Dólar Blue es la cotización del dólar estadounidense en el mercado paralelo o informal de Argentina, por fuera del sistema bancario oficial. Se compra y vende en cuevas o casas de cambio no reguladas."
      }
    },
    {
      "@type": "Question",
      "name": "¿Qué es el Dólar MEP o Bolsa?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El Dólar MEP (Mercado Electrónico de Pagos) o Dólar Bolsa es una forma legal de comprar dólares en Argentina a través de la compra y venta de bonos en pesos y su posterior venta en dólares."
      }
    },
    {
      "@type": "Question", 
      "name": "¿Qué es el Dólar CCL?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El Dólar Contado con Liquidación (CCL) es similar al MEP pero permite transferir los dólares al exterior. Se obtiene comprando activos en pesos en Argentina y vendiéndolos en dólares en el exterior."
      }
    },
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
      "name": "¿Qué es el Riesgo País?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El Riesgo País es un índice (EMBI+) elaborado por JP Morgan que mide la diferencia de rendimiento entre los bonos de un país y los bonos del Tesoro de Estados Unidos. A mayor valor, más riesgoso se considera invertir en ese país. Se expresa en puntos básicos."
      }
    }
  ];

  const title = blueRate 
    ? `Dólar Blue $${blueRate.venta} | Oficial $${oficialRate?.venta} | MEP $${mepRate?.venta} - Hoy`
    : 'Dólar Blue Hoy - Cotización Argentina';

  const description = blueRate
    ? `Cotización ${todayString}: Dólar Blue $${blueRate.venta} | Oficial $${oficialRate?.venta} | MEP $${mepRate?.venta}. Todos los tipos de dólar actualizados.`
    : 'Cotización del Dólar en Argentina';

  return {
    "@context": "https://schema.org",
    "@graph": [
      // Organization
      {
        "@type": "Organization",
        "@id": "https://valordolarblue.ar/#organization",
        "name": "Valor Dólar Blue",
        "url": "https://valordolarblue.ar",
        "logo": {
          "@type": "ImageObject",
          "url": "https://valordolarblue.ar/favicon.png",
          "width": 512,
          "height": 512
        },
        "sameAs": [
          "https://x.com/DolarBlueDiario"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "url": "https://x.com/DolarBlueDiario"
        }
      },
      // WebSite
      {
        "@type": "WebSite",
        "@id": "https://valordolarblue.ar/#website",
        "url": "https://valordolarblue.ar",
        "name": "Valor Dólar Blue Hoy",
        "description": "Cotización del dólar blue, oficial, MEP, CCL y cripto en Argentina",
        "publisher": {
          "@id": "https://valordolarblue.ar/#organization"
        },
        "inLanguage": "es-AR",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://valordolarblue.ar/?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      // WebPage
      {
        "@type": "WebPage",
        "@id": "https://valordolarblue.ar/#webpage",
        "url": "https://valordolarblue.ar",
        "name": title,
        "description": description,
        "isPartOf": {
          "@id": "https://valordolarblue.ar/#website"
        },
        "primaryImageOfPage": {
          "@type": "ImageObject",
          "url": "https://valordolarblue.ar/og-image.png"
        },
        "datePublished": "2024-01-01T00:00:00-03:00",
        "dateModified": blueRate?.fechaActualizacion || new Date().toISOString(),
        "inLanguage": "es-AR"
      },
      // FAQPage - Dynamic with current prices
      {
        "@type": "FAQPage",
        "@id": "https://valordolarblue.ar/#faq",
        "mainEntity": [...faqEntities, ...riesgoPaisFaq, ...staticFaqs]
      },
      // FinancialProduct for Blue
      blueRate && {
        "@type": "FinancialProduct",
        "@id": "https://valordolarblue.ar/#dolar-blue",
        "name": "Dólar Blue Argentina",
        "description": `Cotización del Dólar Blue hoy ${todayString}`,
        "category": "Currency Exchange",
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": blueRate.compra,
          "highPrice": blueRate.venta,
          "priceCurrency": "ARS",
          "offerCount": 2,
          "offers": [
            {
              "@type": "Offer",
              "name": "Compra",
              "price": blueRate.compra,
              "priceCurrency": "ARS"
            },
            {
              "@type": "Offer", 
              "name": "Venta",
              "price": blueRate.venta,
              "priceCurrency": "ARS"
            }
          ]
        }
      },
      // FinancialProduct for Oficial
      oficialRate && {
        "@type": "FinancialProduct",
        "@id": "https://valordolarblue.ar/#dolar-oficial",
        "name": "Dólar Oficial Argentina",
        "description": `Cotización del Dólar Oficial hoy ${todayString}`,
        "category": "Currency Exchange",
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": oficialRate.compra,
          "highPrice": oficialRate.venta,
          "priceCurrency": "ARS"
        }
      },
      // FinancialProduct for MEP
      mepRate && {
        "@type": "FinancialProduct",
        "@id": "https://valordolarblue.ar/#dolar-mep",
        "name": "Dólar MEP Argentina",
        "description": `Cotización del Dólar MEP/Bolsa hoy ${todayString}`,
        "category": "Currency Exchange",
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": mepRate.compra,
          "highPrice": mepRate.venta,
          "priceCurrency": "ARS"
        }
      },
      // WebApplication
      {
        "@type": "WebApplication",
        "@id": "https://valordolarblue.ar/#calculator",
        "name": "Calculadora Dólar a Pesos",
        "description": "Calculadora de conversión de dólares a pesos argentinos con cotización en tiempo real",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "ARS"
        },
        "featureList": [
          "Conversión de dólar a pesos argentinos",
          "Cotización en tiempo real",
          "Gráficos históricos del dólar blue",
          "Múltiples tipos de cambio: Blue, Oficial, MEP, CCL, Cripto"
        ]
      },
      // BreadcrumbList
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Inicio",
            "item": "https://valordolarblue.ar"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Cotizaciones del Dólar",
            "item": "https://valordolarblue.ar/#cotizaciones"
          }
        ]
      }
    ].filter(Boolean) // Remove undefined items
  };
}

export default async function Home() {
  // Server-side data fetching
  const [rates, historicalData, riesgoPais] = await Promise.all([
    fetchDollarRates(),
    fetchHistoricalRates(),
    fetchRiesgoPais()
  ]);

  // Get all blog posts for Wikidólar widget (sorted by date, newest first)
  const latestPosts = getAllPostsMeta();

  // Sort rates by priority
  const order = ['blue', 'oficial', 'bolsa', 'contadoconliqui', 'cripto', 'tarjeta'];
  const prioritizedRates = [...rates].sort((a, b) => {
    const indexA = order.indexOf(a.casa);
    const indexB = order.indexOf(b.casa);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });

  // Generate JSON-LD
  const jsonLd = generateJsonLd(prioritizedRates, riesgoPais);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <HomeClient 
        initialRates={prioritizedRates} 
        initialHistoricalData={historicalData}
        initialRiesgoPais={riesgoPais}
        latestPosts={latestPosts}
      />
    </>
  );
}
