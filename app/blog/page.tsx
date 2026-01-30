import { Metadata } from 'next';
import Link from 'next/link';
import { getAllPostsMeta } from '@/services/blogService';
import { Win98Window, Win98Button } from '@/components/RetroUI';

export const metadata: Metadata = {
  title: 'Wikidólar - Blog sobre el Dólar en Argentina',
  description: 'Artículos, guías y análisis sobre el dólar blue, oficial, MEP, CCL y la economía argentina. Aprende todo sobre el mercado cambiario.',
  openGraph: {
    title: 'Wikidólar - Blog sobre el Dólar en Argentina',
    description: 'Artículos, guías y análisis sobre el dólar blue, oficial, MEP, CCL y la economía argentina.',
    url: 'https://valordolarblue.ar/blog',
  },
  alternates: {
    canonical: 'https://valordolarblue.ar/blog',
  },
};

// Revalidate every hour
export const revalidate = 3600;

// Icons
const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2 2h5v12H2V2zm7 0h5v12H9V2zm-6 1v10h3V3H3zm7 0v10h3V3h-3z" />
  </svg>
);

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1L1 7h2v7h4v-4h2v4h4V7h2L8 1zm0 2.5L12 7v6h-2v-4H6v4H4V7l4-3.5z" />
  </svg>
);

export default function BlogPage() {
  const posts = getAllPostsMeta();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // JSON-LD for Blog
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": "https://valordolarblue.ar/blog",
    "name": "Wikidólar",
    "description": "Blog sobre el dólar y la economía argentina",
    "url": "https://valordolarblue.ar/blog",
    "publisher": {
      "@type": "Organization",
      "name": "Valor Dólar Blue",
      "url": "https://valordolarblue.ar"
    },
    "blogPost": posts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.description,
      "url": `https://valordolarblue.ar/blog/${post.slug}`,
      "datePublished": post.date,
      "author": {
        "@type": "Person",
        "name": post.author
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen flex flex-col font-sans select-none overflow-hidden text-sm">
        {/* Main content */}
        <main className="flex-1 p-4 flex flex-col items-center gap-6 overflow-y-auto pb-16">
          
          {/* Header with back button */}
          <div className="w-full max-w-2xl flex items-center gap-4">
            <Link href="/">
              <Win98Button className="flex items-center gap-2">
                <HomeIcon />
                <span>Inicio</span>
              </Win98Button>
            </Link>
          </div>

          {/* Blog Window */}
          <Win98Window 
            title="Wikidólar - Todos los Artículos" 
            icon={<BookIcon />}
            className="w-full max-w-2xl"
            titleAs="h1"
          >
            <div className="bg-win-gray p-4">
              <p className="font-retro text-sm text-gray-700 mb-4">
                Guías, análisis y artículos sobre el dólar y la economía argentina.
              </p>

              {posts.length === 0 ? (
                <div className="bg-white border-2 p-8 text-center" style={{ borderColor: '#000 #fff #fff #000' }}>
                  <p className="text-gray-600 font-retro">
                    No hay artículos publicados todavía.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {posts.map((post) => (
                    <Link 
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="block"
                    >
                      <article 
                        className="bg-white border-2 p-4 hover:bg-blue-50 transition-colors"
                        style={{ borderColor: '#000 #fff #fff #000' }}
                      >
                        <h2 className="font-retro font-bold text-blue-800 hover:underline text-base mb-2">
                          {post.title}
                        </h2>
                        <p className="text-sm text-gray-600 font-retro mb-3">
                          {post.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <time className="text-xs text-gray-500 font-retro">
                            {formatDate(post.date)}
                          </time>
                          <span className="text-gray-400">•</span>
                          <span className="text-xs text-gray-500 font-retro">
                            Por {post.author}
                          </span>
                          <div className="flex gap-1 ml-auto">
                            {post.tags.map(tag => (
                              <span 
                                key={tag}
                                className="text-[10px] bg-win-teal text-white px-2 py-0.5 font-retro"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Win98Window>
        </main>

        {/* Simple footer */}
        <footer className="h-10 bg-win-gray border-t-2 border-white flex items-center justify-center px-4 fixed bottom-0 w-full shadow-lg z-50">
          <span className="font-retro text-xs text-gray-600">
            Wikidólar - Blog de ValorDolarBlue.ar
          </span>
        </footer>
      </div>
    </>
  );
}
