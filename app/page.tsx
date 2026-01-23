import { Metadata } from 'next';
import { fetchDollarRates } from '@/services/dolarService';
import { fetchHistoricalRates } from '@/services/historyService';
import { getDollarDisplayName } from '@/components/DollarCard';
import { DolarRate } from '@/types';
import HomeClient from './HomeClient';

// Revalidate every 60 seconds for fresh data
export const revalidate = 60;

// Dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
  const rates = await fetchDollarRates();
  const blueRate = rates.find(r => r.casa === 'blue');
  const oficialRate = rates.find(r => r.casa === 'oficial');
  const mepRate = rates.find(r => r.casa === 'bolsa');
  
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const todayString = new Date().toLocaleDateString('es-AR', dateOptions);
  
  const title = blueRate 
    ? `Dólar Blue $${blueRate.venta} | Oficial $${oficialRate?.venta} | MEP $${mepRate?.venta} - Hoy ${todayString}`
    : 'Dólar Blue Hoy - Cotización en Tiempo Real Argentina';
  
  const description = blueRate
    ? `💵 Cotización ${todayString}: Dólar Blue $${blueRate.venta} | Oficial $${oficialRate?.venta} | MEP $${mepRate?.venta}. Todos los tipos de dólar en Argentina actualizados. Calculadora y gráficos.`
    : 'Cotización del Dólar Blue, Oficial, MEP, CCL y Cripto en Argentina. Valores actualizados de compra y venta.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: 'https://valordolarblue.com.ar/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Cotización Dólar Blue Argentina',
        },
      ],
    },
    twitter: {
      title,
      description,
      images: ['https://valordolarblue.com.ar/og-image.png'],
    },
  };
}

// Generate JSON-LD schemas
function generateJsonLd(rates: DolarRate[]) {
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
        "@id": "https://valordolarblue.com.ar/#organization",
        "name": "Valor Dólar Blue",
        "url": "https://valordolarblue.com.ar",
        "logo": {
          "@type": "ImageObject",
          "url": "https://valordolarblue.com.ar/favicon.png",
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
        "@id": "https://valordolarblue.com.ar/#website",
        "url": "https://valordolarblue.com.ar",
        "name": "Valor Dólar Blue Hoy",
        "description": "Cotización del dólar blue, oficial, MEP, CCL y cripto en Argentina",
        "publisher": {
          "@id": "https://valordolarblue.com.ar/#organization"
        },
        "inLanguage": "es-AR",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://valordolarblue.com.ar/?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      // WebPage
      {
        "@type": "WebPage",
        "@id": "https://valordolarblue.com.ar/#webpage",
        "url": "https://valordolarblue.com.ar",
        "name": title,
        "description": description,
        "isPartOf": {
          "@id": "https://valordolarblue.com.ar/#website"
        },
        "primaryImageOfPage": {
          "@type": "ImageObject",
          "url": "https://valordolarblue.com.ar/og-image.png"
        },
        "datePublished": "2024-01-01T00:00:00-03:00",
        "dateModified": blueRate?.fechaActualizacion || new Date().toISOString(),
        "inLanguage": "es-AR"
      },
      // FAQPage - Dynamic with current prices
      {
        "@type": "FAQPage",
        "@id": "https://valordolarblue.com.ar/#faq",
        "mainEntity": [...faqEntities, ...staticFaqs]
      },
      // FinancialProduct for Blue
      blueRate && {
        "@type": "FinancialProduct",
        "@id": "https://valordolarblue.com.ar/#dolar-blue",
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
        "@id": "https://valordolarblue.com.ar/#dolar-oficial",
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
        "@id": "https://valordolarblue.com.ar/#dolar-mep",
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
        "@id": "https://valordolarblue.com.ar/#calculator",
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
            "item": "https://valordolarblue.com.ar"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Cotizaciones del Dólar",
            "item": "https://valordolarblue.com.ar/#cotizaciones"
          }
        ]
      }
    ].filter(Boolean) // Remove undefined items
  };
}

export default async function Home() {
  // Server-side data fetching
  const [rates, historicalData] = await Promise.all([
    fetchDollarRates(),
    fetchHistoricalRates()
  ]);

  // Sort rates by priority
  const order = ['blue', 'oficial', 'bolsa', 'contadoconliqui', 'cripto', 'tarjeta'];
  const prioritizedRates = [...rates].sort((a, b) => {
    const indexA = order.indexOf(a.casa);
    const indexB = order.indexOf(b.casa);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });

  // Generate JSON-LD
  const jsonLd = generateJsonLd(prioritizedRates);

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
      />
    </>
  );
}
