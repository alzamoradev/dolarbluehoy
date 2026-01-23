import type { Metadata, Viewport } from 'next';
import { fetchDollarRates } from '@/services/dolarService';
import { getDollarDisplayName } from '@/components/DollarCard';
import './globals.css';

// Dynamic metadata generation
export async function generateMetadata(): Promise<Metadata> {
  const rates = await fetchDollarRates();
  const blueRate = rates.find(r => r.casa === 'blue');
  
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const todayString = new Date().toLocaleDateString('es-AR', dateOptions);
  
  const title = blueRate 
    ? `Dólar Blue Hoy $${blueRate.venta} - Cotización Argentina ${todayString}`
    : 'Dólar Blue Hoy - Cotización en Tiempo Real Argentina';
  
  const description = blueRate
    ? `💵 Dólar Blue hoy ${todayString}: Compra $${blueRate.compra} - Venta $${blueRate.venta}. Cotizaciones en vivo del dólar oficial, MEP, CCL y cripto. Calculadora y gráficos históricos.`
    : 'Cotización del Dólar Blue en Argentina. Valores actualizados de compra y venta, dólar oficial, MEP, CCL. Calculadora de conversión.';

  // Generate FAQ for all rates
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

  // Add static FAQs
  const staticFaqs = [
    {
      "@type": "Question",
      "name": "¿Qué es el Dólar Blue?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El Dólar Blue es la cotización del dólar estadounidense en el mercado paralelo o informal de Argentina, por fuera del sistema bancario oficial."
      }
    },
    {
      "@type": "Question",
      "name": "¿Qué es el carry trade?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El carry trade, conocido como 'bicicleta financiera', es una estrategia que consiste en vender dólares, invertir los pesos en instrumentos con tasa de interés y luego recomprar divisas, buscando obtener una ganancia superior a la devaluación."
      }
    }
  ];

  // JSON-LD Structured Data
  const jsonLd = {
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
          "url": "https://valordolarblue.com.ar/icons/inicio.png"
        },
        "sameAs": [
          "https://x.com/DolarBlueDiario"
        ]
      },
      // WebSite
      {
        "@type": "WebSite",
        "@id": "https://valordolarblue.com.ar/#website",
        "url": "https://valordolarblue.com.ar",
        "name": "Valor Dólar Blue Hoy",
        "description": "Cotización del dólar blue y todas las cotizaciones del dólar en Argentina",
        "publisher": {
          "@id": "https://valordolarblue.com.ar/#organization"
        },
        "inLanguage": "es-AR"
      },
      // WebPage with price info
      {
        "@type": "WebPage",
        "@id": "https://valordolarblue.com.ar/#webpage",
        "url": "https://valordolarblue.com.ar",
        "name": title,
        "description": description,
        "isPartOf": {
          "@id": "https://valordolarblue.com.ar/#website"
        },
        "about": {
          "@type": "FinancialProduct",
          "name": "Dólar Blue Argentina",
          "description": "Cotización del dólar en el mercado paralelo argentino",
          "offers": blueRate ? {
            "@type": "Offer",
            "price": blueRate.venta,
            "priceCurrency": "ARS",
            "priceValidUntil": new Date(Date.now() + 3600000).toISOString(),
            "availability": "https://schema.org/InStock"
          } : undefined
        },
        "datePublished": "2024-01-01T00:00:00-03:00",
        "dateModified": blueRate?.fechaActualizacion || new Date().toISOString(),
        "inLanguage": "es-AR"
      },
      // FAQPage
      {
        "@type": "FAQPage",
        "mainEntity": [...faqEntities, ...staticFaqs]
      },
      // SoftwareApplication
      {
        "@type": "WebApplication",
        "name": "Calculadora Dólar Blue",
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
          "Gráficos históricos",
          "Múltiples tipos de cambio"
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
            "name": "Cotización Dólar Blue",
            "item": "https://valordolarblue.com.ar/#cotizaciones"
          }
        ]
      }
    ]
  };

  return {
    title,
    description,
    keywords: [
      'dolar blue hoy', 'cotizacion dolar blue', 'dolar hoy argentina',
      'dolar mep', 'dolar ccl', 'dolar oficial', 'valor dolar blue',
      'precio dolar blue', 'dolar paralelo', 'cambio dolar argentina',
      'calculadora dolar', 'convertir dolares a pesos'
    ],
    authors: [{ name: 'ValorDolarBlue', url: 'https://x.com/DolarBlueDiario' }],
    creator: 'ValorDolarBlue',
    publisher: 'ValorDolarBlue',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'es_AR',
      url: 'https://valordolarblue.com.ar',
      title,
      description,
      siteName: 'Valor Dólar Blue',
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
      card: 'summary_large_image',
      title,
      description,
      creator: '@DolarBlueDiario',
      images: ['https://valordolarblue.com.ar/og-image.png'],
    },
    alternates: {
      canonical: 'https://valordolarblue.com.ar',
    },
    other: {
      'application/ld+json': JSON.stringify(jsonLd),
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#008080',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className="min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}

