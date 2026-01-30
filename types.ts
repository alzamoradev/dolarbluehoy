export interface DolarRate {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

export interface HistoricalRate {
  fecha: string;
  compra: number;
  venta: number;
}

export interface SEOMetadata {
  title: string;
  description: string;
  url: string;
  image: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface MarketInsight {
  analysisDollar: string;
  analysisPeso: string;
  disclaimer: string;
  sources?: string[];
}

export interface RiesgoPais {
  valor: number;
  fecha: string;
  variacion: string;
  tendencia: 'up' | 'down' | 'neutral';
}

// Blog types
export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  image?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string; // HTML content
  faqs: FAQ[]; // Auto-extracted FAQs
}
