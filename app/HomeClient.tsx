'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { HistoricalRate, MarketInsight, AnalysisStatus, RiesgoPais } from '@/types';
import { DolarRateWithVariation } from '@/services/dolarService';
import { Win98Window, Win98Button, Win98Panel } from '@/components/RetroUI';
import { DollarCard, getDollarDisplayName } from '@/components/DollarCard';
import { HistoryChart } from '@/components/HistoryChart';
import { Calculator } from '@/components/Calculator';
import { RiesgoPaisCard } from '@/components/RiesgoPaisCard';
import { Minesweeper } from '@/components/Minesweeper';
import { analyzeMarket } from '@/services/geminiService';

// --- SVG Icons ---
const ComputerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M1 2h14v10H1V2zm1 1v8h12V3H2zm3 11h6v1H5v-1z" />
  </svg>
);

const ChartIcon = () => (
  <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor">
    <path d="M1 14h14v1H1v-1zm2-4h2v3H3v-3zm4-3h2v6H7V7zm4-4h2v10h-2V3z" />
  </svg>
);

const NetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1a6 6 0 110 12A6 6 0 018 2zm-1 2h2v2H7V4zm0 3h2v5H7V7z" />
  </svg>
);

const HelpIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect x="4" y="4" width="24" height="24" fill="#000080" />
    <path d="M8 8H24V24H8V8Z" fill="#FFF" />
    <text x="16" y="22" fontSize="16" textAnchor="middle" fill="#000080" fontWeight="bold">?</text>
    <path d="M6 6H26V26H6V6Z" stroke="#808080" strokeWidth="2" fill="none" />
  </svg>
);

const AlertIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14" fill="#F00" />
    <path d="M10 10 L22 22 M22 10 L10 22" stroke="#FFF" strokeWidth="4" />
  </svg>
);

const StartIconSVG = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2H14V14H2V2Z" fill="#000"/>
    <path d="M3 3H5V5H3V3Z" fill="#F00"/>
    <path d="M6 3H8V5H6V3Z" fill="#0F0"/>
    <path d="M9 3H11V5H9V3Z" fill="#00F"/>
    <path d="M12 3H14V5H12V3Z" fill="#FF0"/>
  </svg>
);

const HLIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="drop-shadow-md">
    <circle cx="16" cy="16" r="14" fill="#E65100" stroke="#333" strokeWidth="1"/>
    <path d="M11 11 L16 21 L21 11 M16 21 L16 8" stroke="#FDB813" strokeWidth="3" strokeLinecap="round" />
    <text x="24" y="10" fontSize="8" fill="#FDB813" fontWeight="bold">λ</text>
  </svg>
);

const QuakeIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="drop-shadow-md">
    <path d="M16 4 C 10 4 5 9 5 15 C 5 21 10 26 16 26 C 18 26 20 25 22 24 L 22 28 L 26 24 C 29 20 29 15 27 10" fill="#8B4513" stroke="#5A300C" strokeWidth="2"/>
    <path d="M16 8 C 12 8 9 11 9 15 C 9 18 11 21 14 22 L 14 22" fill="#5A300C" />
    <rect x="15" y="6" width="2" height="20" fill="#D2691E" />
  </svg>
);

const MKIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="drop-shadow-md">
    <circle cx="16" cy="16" r="15" fill="#000" stroke="#FFD700" strokeWidth="1"/>
    <path d="M16 4 Q 24 4 26 10 Q 28 16 24 22 Q 20 28 12 28 Q 14 24 14 20 Q 10 20 8 24 Q 6 18 10 12 Q 12 8 16 4" fill="#FFD700" />
  </svg>
);

// --- Image with Fallback ---
interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallback: React.ReactNode;
  className?: string;
  width?: number;
  height?: number;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ fallback, src, alt, className, width = 40, height = 40 }) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return <div className={`flex items-center justify-center ${className}`}>{fallback}</div>;
  }

  return (
    <Image 
      src={src} 
      alt={alt} 
      width={width}
      height={height}
      className={className} 
      onError={() => setError(true)}
    />
  );
};

// --- Main Component ---
interface HomeClientProps {
  initialRates: DolarRateWithVariation[];
  initialHistoricalData: HistoricalRate[];
  initialRiesgoPais: RiesgoPais | null;
}

export default function HomeClient({ initialRates, initialHistoricalData, initialRiesgoPais }: HomeClientProps) {
  const [rates] = useState<DolarRateWithVariation[]>(initialRates);
  const [historicalData] = useState<HistoricalRate[]>(initialHistoricalData);
  const [riesgoPais] = useState<RiesgoPais | null>(initialRiesgoPais);
  const [insight, setInsight] = useState<MarketInsight | null>(null);
  const [aiStatus, setAiStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  
  // UI State
  const [historyOpen, setHistoryOpen] = useState(false);
  const [cyberAlertOpen, setCyberAlertOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [minesweeperOpen, setMinesweeperOpen] = useState(false);
  
  // Clock state
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Rate limiting: max 1 request per 30 minutes
  const checkRateLimit = (): { allowed: boolean; remainingTime?: number } => {
    const RATE_LIMIT = 1;
    const WINDOW_MS = 30 * 60 * 1000; // 30 minutes
    const now = Date.now();
    
    const stored = localStorage.getItem('ai_rate_limit');
    let requests: number[] = stored ? JSON.parse(stored) : [];
    
    // Filter requests within the time window
    requests = requests.filter(time => now - time < WINDOW_MS);
    
    if (requests.length >= RATE_LIMIT) {
      const oldestRequest = Math.min(...requests);
      const remainingTime = Math.ceil((WINDOW_MS - (now - oldestRequest)) / 60000);
      return { allowed: false, remainingTime };
    }
    
    // Add current request
    requests.push(now);
    localStorage.setItem('ai_rate_limit', JSON.stringify(requests));
    return { allowed: true };
  };

  const [rateLimitMsg, setRateLimitMsg] = useState<string | null>(null);

  const handleConsultAI = async () => {
    if (rates.length === 0) return;
    
    // Check rate limit
    const { allowed, remainingTime } = checkRateLimit();
    if (!allowed) {
      setRateLimitMsg(`Límite alcanzado. Podés volver a analizar en ${remainingTime} minutos.`);
      return;
    }
    setRateLimitMsg(null);
    
    setAiStatus(AnalysisStatus.LOADING);
    try {
      const result = await analyzeMarket(rates);
      setInsight(result);
      setAiStatus(AnalysisStatus.SUCCESS);
    } catch {
      setAiStatus(AnalysisStatus.ERROR);
    }
  };

  const handleTwitterFollow = () => {
    window.open('https://x.com/DolarBlueDiario', '_blank');
    setCyberAlertOpen(false);
  };

  // Generate FAQ items
  const faqItems = useMemo(() => {
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const todayString = new Date().toLocaleDateString('es-AR', dateOptions);
    
    const dynamic = rates.map(rate => {
      const displayName = getDollarDisplayName(rate.casa, rate.nombre);
      return {
        q: `¿Cuál es el valor del ${displayName} hoy?`,
        a: `El valor del ${displayName} hoy ${todayString} es de $${rate.venta} para la venta y $${rate.compra} para la compra.`
      };
    });

    // Dynamic Riesgo País FAQ
    const riesgoPaisFaq = riesgoPais ? [
      {
        q: "¿Cuál es el Riesgo País de Argentina hoy?",
        a: `El Riesgo País de Argentina hoy ${todayString} es de ${riesgoPais.valor} puntos, con una variación del ${riesgoPais.variacion}. Este índice EMBI+ es elaborado por JP Morgan.`
      }
    ] : [];

    const statics = [
      {
        q: "¿Qué es el Riesgo País?",
        a: "El Riesgo País es un índice (EMBI+) elaborado por JP Morgan que mide la diferencia de rendimiento entre los bonos de un país y los bonos del Tesoro de Estados Unidos. A mayor valor, más riesgoso se considera invertir en ese país."
      },
      {
        q: "¿Qué es el carry trade?",
        a: "El carry trade, conocido como 'bicicleta financiera', es una estrategia que consiste en vender dólares, invertir los pesos en instrumentos con tasa de interés (como Plazos Fijos o Lecaps) y luego recomprar divisas, buscando obtener una ganancia superior a la devaluación del período."
      },
      {
        q: "¿Qué es el Dólar Blue?",
        a: "El Dólar Blue es la cotización del dólar estadounidense en el mercado paralelo o informal de Argentina, por fuera del sistema bancario oficial."
      }
    ];

    return [...dynamic, ...riesgoPaisFaq, ...statics];
  }, [rates, riesgoPais]);

  // Generate H1 with all dollar types and riesgo país
  const h1Text = useMemo(() => {
    const blueRate = rates.find(r => r.casa === 'blue');
    const oficialRate = rates.find(r => r.casa === 'oficial');
    const mepRate = rates.find(r => r.casa === 'bolsa');
    
    const riesgoText = riesgoPais ? ` | Riesgo País ${riesgoPais.valor}` : '';
    
    if (blueRate && oficialRate && mepRate) {
      return `Dólar Blue $${blueRate.venta} | Oficial $${oficialRate.venta} | MEP $${mepRate.venta}${riesgoText} - Cotización Hoy`;
    }
    return 'Cotización Dólar Blue, Oficial, MEP, CCL y Cripto Hoy Argentina';
  }, [rates, riesgoPais]);

  // Desktop Icons Component (reusable for desktop and mobile)
  const DesktopIcons = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`flex ${isMobile ? 'flex-row flex-wrap justify-center gap-4 py-4' : 'flex-col gap-6'} items-center text-white ${isMobile ? 'w-full' : 'w-20'}`}>
      <a href="https://x.com/DolarBlueDiario" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 group cursor-pointer text-shadow">
        <div className="w-10 h-10 bg-black flex items-center justify-center border-2 border-gray-400 group-hover:bg-blue-900 group-hover:border-blue-300 transition-colors shadow-md">
          <span className="text-2xl">𝕏</span>
        </div>
        <span className="bg-win-teal text-xs px-1 group-hover:bg-blue-900 group-hover:border-dotted group-hover:border-white border border-transparent font-retro tracking-wide">@DolarBlue</span>
      </a>
      
      <button onClick={() => setHistoryOpen(true)} className="flex flex-col items-center gap-1 group cursor-pointer text-shadow">
        <ImageWithFallback 
          src="/icons/historico.png" 
          alt="Ver histórico del dólar blue" 
          fallback={<ChartIcon />}
          className="w-10 h-10 object-contain drop-shadow-md" 
        />
        <span className="bg-win-teal text-xs px-1 group-hover:bg-blue-900 group-hover:border-dotted group-hover:border-white border border-transparent font-retro tracking-wide">Histórico</span>
      </button>

      <button onClick={() => setFaqOpen(true)} className="flex flex-col items-center gap-1 group cursor-pointer text-shadow">
        <HelpIcon />
        <span className="bg-win-teal text-xs px-1 group-hover:bg-blue-900 group-hover:border-dotted group-hover:border-white border border-transparent font-retro tracking-wide text-center leading-tight">Preguntas</span>
      </button>

      {/* Playable Games */}
      <button onClick={() => setMinesweeperOpen(true)} className="flex flex-col items-center gap-1 group cursor-pointer text-shadow">
        <ImageWithFallback 
          src="/icons/buscaminas.png" 
          alt="Buscaminas" 
          fallback={<span className="text-2xl">💣</span>}
          className="w-10 h-10 object-contain drop-shadow-md" 
        />
        <span className="bg-win-teal text-xs px-1 group-hover:bg-blue-900 group-hover:border-dotted group-hover:border-white border border-transparent font-retro tracking-wide">Buscaminas</span>
      </button>

      {/* Decorative Games (show cyber alert) */}
      <button onClick={() => setCyberAlertOpen(true)} className="flex flex-col items-center gap-1 group cursor-pointer text-shadow">
        <ImageWithFallback 
          src="/icons/half-life-1.png" 
          alt="Half-Life" 
          fallback={<HLIcon />}
          className="w-10 h-10 object-contain drop-shadow-md" 
        />
        <span className="bg-win-teal text-xs px-1 group-hover:bg-blue-900 group-hover:border-dotted group-hover:border-white border border-transparent font-retro tracking-wide">Half-Life</span>
      </button>

      <button onClick={() => setCyberAlertOpen(true)} className="flex flex-col items-center gap-1 group cursor-pointer text-shadow">
        <ImageWithFallback 
          src="/icons/quake.png" 
          alt="Quake" 
          fallback={<QuakeIcon />}
          className="w-10 h-10 object-contain drop-shadow-md" 
        />
        <span className="bg-win-teal text-xs px-1 group-hover:bg-blue-900 group-hover:border-dotted group-hover:border-white border border-transparent font-retro tracking-wide">Quake</span>
      </button>

      <button onClick={() => setCyberAlertOpen(true)} className="flex flex-col items-center gap-1 group cursor-pointer text-shadow">
        <ImageWithFallback 
          src="/icons/mortal-kombat-1.png" 
          alt="Mortal Kombat" 
          fallback={<MKIcon />}
          className="w-10 h-10 object-contain drop-shadow-md" 
        />
        <span className="bg-win-teal text-xs px-1 group-hover:bg-blue-900 group-hover:border-dotted group-hover:border-white border border-transparent font-retro tracking-wide text-center">MK</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans select-none overflow-hidden text-sm">
      {/* SEO H1 - Visually hidden but accessible */}
      <h1 className="sr-only">{h1Text}</h1>
      
      {/* Desktop Area */}
      <main className="flex-1 p-4 relative flex flex-col md:flex-row gap-6 overflow-y-auto pb-16" id="cotizaciones">
        
        {/* Main Rates Window */}
        <Win98Window 
          title="Cotizaciones del Dólar Hoy" 
          icon={<ComputerIcon />} 
          className="w-full md:max-w-md z-10 h-fit"
        >
          <div className="bg-win-gray p-2 h-full">
            <nav className="flex gap-4 mb-4 text-xs font-retro" aria-label="Menú de aplicación">
              <span className="underline cursor-pointer text-blue-800">Archivo</span>
              <span className="underline cursor-pointer text-blue-800">Edición</span>
              <span className="underline cursor-pointer text-blue-800">Ver</span>
              <span className="underline cursor-pointer text-blue-800">Ayuda</span>
            </nav>

            <section className="grid gap-4" aria-label="Cotizaciones del dólar">
              {rates.map((rate) => (
                <DollarCard key={rate.casa} rate={rate} />
              ))}
            </section>
          </div>
        </Win98Window>

        {/* Middle Column: Calculator + AI Assistant */}
        <div className="w-full md:max-w-md flex flex-col gap-6">
          {/* Calculator */}
          <Calculator rates={rates} />

          {/* AI Assistant Window */}
          <Win98Window 
            title="¿Invertir en pesos o en dólares?" 
            icon={<NetIcon />}
            className="w-full z-0 h-fit"
            onClose={() => setAiStatus(AnalysisStatus.IDLE)}
          >
            <div className="p-4 bg-win-gray">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl animate-bounce" aria-hidden="true">📎</div>
                <div className="bg-[#FFFFE1] border border-black p-3 relative shadow-md text-black font-retro leading-tight w-full">
                  <div className="absolute -left-2 top-2 w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-r-black border-b-[8px] border-b-transparent"></div>
                  {aiStatus === AnalysisStatus.IDLE && "¡Hola! Te muestro los escenarios de invertir en Dólar vs Peso analizando el mercado actual. Acordate que esto no es asesoramiento financiero."}
                  {aiStatus === AnalysisStatus.LOADING && "Analizando el mercado... bancame unos segundos."}
                  {aiStatus === AnalysisStatus.SUCCESS && insight && (
                    <div className="flex flex-col gap-2">
                      <div className="border-b border-black pb-1">
                        <span className="font-bold">💵 Escenario Dólar:</span>
                        <p className="text-xs">{insight.analysisDollar}</p>
                      </div>
                      
                      <div className="border-b border-black pb-1">
                        <span className="font-bold">🇦🇷 Escenario Peso (Carry Trade):</span>
                        <p className="text-xs">{insight.analysisPeso}</p>
                      </div>
                      
                      {insight.sources && insight.sources.length > 0 && (
                        <div className="mt-1">
                          <p className="text-[10px] text-gray-500">Fuentes:</p>
                          <ul className="list-disc pl-4 text-[10px] text-blue-800">
                            {insight.sources.map((src, idx) => (
                              <li key={idx}>
                                <a href={src} target="_blank" rel="noopener noreferrer" className="hover:underline truncate block w-full">
                                  {new URL(src).hostname}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mt-2 bg-red-100 border border-red-500 p-1 text-[10px] text-red-800 font-bold text-center">
                        ⚠️ {insight.disclaimer}
                      </div>
                    </div>
                  )}
                  {aiStatus === AnalysisStatus.ERROR && "Hubo un problema al analizar. Intentá de nuevo en unos minutos."}
                  {rateLimitMsg && (
                    <div className="text-orange-700 font-bold">
                      ⏱️ {rateLimitMsg}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Win98Button onClick={handleConsultAI} disabled={aiStatus === AnalysisStatus.LOADING}>
                  {aiStatus === AnalysisStatus.LOADING ? 'Analizando...' : 'Analizar Escenarios'}
                </Win98Button>
              </div>
            </div>
          </Win98Window>
        </div>

        {/* Right Column: Riesgo País */}
        <div className="w-full md:w-72 flex-shrink-0">
          <RiesgoPaisCard riesgoPais={riesgoPais} />
        </div>

        {/* FAQ Window */}
        {faqOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <Win98Window
              title="Preguntas Frecuentes sobre el Dólar"
              className="w-full max-w-lg max-h-[80vh] shadow-2xl"
              onClose={() => setFaqOpen(false)}
            >
              <div className="bg-white p-4 h-full overflow-y-auto text-black font-retro text-sm max-h-[60vh]">
                <div className="flex flex-col gap-4">
                  {faqItems.map((item, idx) => (
                    <div key={idx} className="pb-2">
                      <h3 className="font-bold text-blue-800 mb-1 font-retro">❓ {item.q}</h3>
                      <p className="text-gray-800 pl-4 bg-gray-50 p-2 border-l-4 border-win-teal font-retro">{item.a}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Win98Button onClick={() => setFaqOpen(false)}>Cerrar</Win98Button>
                </div>
              </div>
            </Win98Window>
          </div>
        )}

        {/* History Window */}
        {historyOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <Win98Window 
              title="Gráfico Histórico del Dólar Blue" 
              className="w-full max-w-md shadow-2xl"
              onClose={() => setHistoryOpen(false)}
            >
              <div className="p-2 bg-win-gray flex flex-col items-center">
                <HistoryChart data={historicalData} />
                <div className="mt-2 w-full flex justify-end">
                  <Win98Button onClick={() => setHistoryOpen(false)}>Cerrar</Win98Button>
                </div>
              </div>
            </Win98Window>
          </div>
        )}

        {/* Cyber Alert */}
        {cyberAlertOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <Win98Window 
              title="Control de CiberCafé - Server" 
              className="w-96 shadow-2xl"
              onClose={() => setCyberAlertOpen(false)}
              titleAs="span"
            >
              <div className="p-6 bg-win-gray flex flex-col items-center gap-4 text-center">
                <div className="flex items-center gap-4 w-full justify-center">
                  <AlertIcon />
                  <div className="text-black font-retro text-lg leading-tight text-left">
                    Se te terminó el tiempo en el cyber maquinola.
                  </div>
                </div>
                <div className="text-sm text-gray-700 font-retro">
                  Ahora seguime en Twitter (X) y seguí el valor del dólar en vivo.
                </div>
                <div className="w-full flex justify-center mt-2 gap-2">
                  <Win98Button onClick={handleTwitterFollow} className="w-32 font-bold">
                    Seguime en X
                  </Win98Button>
                  <Win98Button onClick={() => setCyberAlertOpen(false)} className="w-24">
                    Cerrar
                  </Win98Button>
                </div>
              </div>
            </Win98Window>
          </div>
        )}

        {/* Minesweeper Game Window */}
        {minesweeperOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <Win98Window 
              title="Buscaminas" 
              className="shadow-2xl"
              onClose={() => setMinesweeperOpen(false)}
            >
              <Minesweeper />
            </Win98Window>
          </div>
        )}

        {/* Desktop Icons - Hidden on mobile, shown on desktop */}
        <aside className="hidden md:flex absolute top-4 right-4 flex-col gap-6 items-center text-white w-20" aria-label="Accesos directos">
          <DesktopIcons />
        </aside>
      </main>

      {/* Mobile Icons Section - Visible only on mobile */}
      <section className="md:hidden bg-win-teal/30 border-t-2 border-white px-4 pb-4" aria-label="Accesos directos móvil">
        <DesktopIcons isMobile={true} />
      </section>

      {/* Taskbar */}
      <footer className="h-10 bg-win-gray border-t-2 border-white flex items-center px-1 gap-1 fixed bottom-0 w-full shadow-lg z-50">
        <Win98Button className="flex items-center gap-1 font-bold px-2 py-0.5 h-8">
          <ImageWithFallback 
            src="/icons/inicio.png" 
            alt="Inicio" 
            fallback={<StartIconSVG />}
            className="w-5 h-5 object-contain"
            width={20}
            height={20}
          />
          <span>Inicio</span>
        </Win98Button>
        <div className="w-[2px] h-6 bg-gray-400 mx-1 border-l border-gray-600 border-r border-white"></div>
        
        {/* Active Tab */}
        <div className="h-8 bg-[#e0e0e0] flex items-center gap-2 px-4 border-2 border-b-white border-r-white border-t-black border-l-black shadow-inner active:bg-win-gray w-48 cursor-default">
          <ComputerIcon />
          <span className="text-xs font-retro truncate text-black">ValorDolarBlue.exe</span>
        </div>

        <div className="flex-1"></div>

        {/* System Tray */}
        <Win98Panel className="h-8 px-3 flex items-center gap-2 min-w-[100px] justify-between">
          <div className="flex gap-1 text-black">
            <span className="text-xs">🔊</span>
            <span className="text-xs">💿</span>
          </div>
          <time className="font-retro text-xs text-black">
            {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </time>
        </Win98Panel>
      </footer>
    </div>
  );
}
