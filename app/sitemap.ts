import { MetadataRoute } from 'next';
import { getAllPostsMeta } from '@/services/blogService';

// ISR: Regenerar el sitemap cada 60 segundos
// Esto asegura que Google siempre vea una fecha reciente
export const revalidate = 60;

// Forzar generación dinámica (no estática en build time)
export const dynamic = 'force-dynamic';

async function getLastUpdateDate(): Promise<Date> {
  try {
    // Obtener la fecha de la última cotización real desde la API
    const response = await fetch('https://dolarapi.com/v1/dolares/blue', {
      next: { revalidate: 60 }
    });
    
    if (response.ok) {
      const data = await response.json();
      // La API devuelve fechaActualizacion en formato ISO
      if (data.fechaActualizacion) {
        return new Date(data.fechaActualizacion);
      }
    }
  } catch (error) {
    console.error('Error fetching last update date for sitemap:', error);
  }
  
  // Fallback: usar la fecha actual del servidor
  return new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://valordolarblue.ar';
  
  // Obtener la fecha de la última actualización de cotizaciones
  const lastModified = await getLastUpdateDate();
  
  // Obtener todos los artículos del blog
  const blogPosts = getAllPostsMeta();
  
  // URLs del blog
  const blogUrls: MetadataRoute.Sitemap = blogPosts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));
  
  return [
    // Homepage - cotizaciones en tiempo real
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'hourly',
      priority: 1,
    },
    // Página del blog (listado)
    {
      url: `${baseUrl}/blog`,
      lastModified: blogPosts.length > 0 ? new Date(blogPosts[0].date) : new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    // Artículos individuales del blog
    ...blogUrls,
  ];
}

