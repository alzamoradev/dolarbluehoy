import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://valordolarblue.com.ar';
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always', // Cotizaciones se actualizan constantemente
      priority: 1,
    },
    {
      url: `${baseUrl}/#cotizaciones`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
  ];
}

