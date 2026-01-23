import type { Metadata, Viewport } from 'next';
import './globals.css';

// Static metadata - dynamic content will be in page.tsx
export const metadata: Metadata = {
  title: {
    template: '%s | Valor Dólar Blue Argentina',
    default: 'Dólar Blue Hoy - Cotización en Tiempo Real Argentina',
  },
  description: 'Cotización del Dólar Blue, Oficial, MEP, CCL y Cripto en Argentina. Valores actualizados de compra y venta. Calculadora de conversión y gráficos históricos.',
  keywords: [
    'dolar blue hoy', 'cotizacion dolar blue', 'dolar hoy argentina',
    'dolar mep hoy', 'dolar ccl hoy', 'dolar oficial hoy', 'valor dolar blue',
    'precio dolar blue', 'dolar paralelo', 'cambio dolar argentina',
    'dolar tarjeta', 'dolar cripto', 'cotizacion dolar mep',
    'calculadora dolar', 'convertir dolares a pesos', 'dolar bolsa'
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
    url: 'https://valordolarblue.ar',
    siteName: 'Valor Dólar Blue',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@DolarBlueDiario',
  },
  alternates: {
    canonical: 'https://valordolarblue.ar',
  },
};

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
        <meta name="google-site-verification" content="98xyPZeozKYc4ps9GChN4TkEPr7G8Kz0HtSCzT2vEPo" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet" />
        <link rel="icon" href="/icons/inicio.png" />
        <link rel="apple-touch-icon" href="/icons/inicio.png" />
      </head>
      <body className="min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
