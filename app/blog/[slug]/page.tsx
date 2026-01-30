import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPostSlugs, getPostBySlug } from '@/services/blogService';
import { Win98Window, Win98Button } from '@/components/RetroUI';

// Generate static params for all posts
export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Generate metadata for each post
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) {
    return {
      title: 'Artículo no encontrado',
    };
  }

  return {
    title: `${post.title} | Wikidólar`,
    description: post.description,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      url: `https://valordolarblue.ar/blog/${slug}`,
      images: post.image ? [{ url: post.image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `https://valordolarblue.ar/blog/${slug}`,
    },
  };
}

// Icons
const ArticleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M3 1h10v14H3V1zm1 1v12h8V2H4zm1 2h6v1H5V4zm0 2h6v1H5V6zm0 2h4v1H5V8z" />
  </svg>
);

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 2L2 8l6 6V9h6V7H8V2z" />
  </svg>
);

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1L1 7h2v7h4v-4h2v4h4V7h2L8 1zm0 2.5L12 7v6h-2v-4H6v4H4V7l4-3.5z" />
  </svg>
);

export default async function BlogPostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // JSON-LD for Article
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `https://valordolarblue.ar/blog/${slug}`,
    "headline": post.title,
    "description": post.description,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Valor Dólar Blue",
      "url": "https://valordolarblue.ar",
      "logo": {
        "@type": "ImageObject",
        "url": "https://valordolarblue.ar/favicon.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://valordolarblue.ar/blog/${slug}`
    },
    "image": post.image || "https://valordolarblue.ar/og-image.png",
    "keywords": post.tags.join(", "),
    "articleSection": "Economía",
    "inLanguage": "es-AR"
  };

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
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
        "name": "Wikidólar",
        "item": "https://valordolarblue.ar/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://valordolarblue.ar/blog/${slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      
      <div className="min-h-screen flex flex-col font-sans select-none overflow-hidden text-sm">
        {/* Main content */}
        <main className="flex-1 p-4 flex flex-col items-center gap-6 overflow-y-auto pb-16">
          
          {/* Navigation buttons */}
          <nav className="w-full max-w-2xl flex items-center gap-2" aria-label="Navegación">
            <Link href="/">
              <Win98Button className="flex items-center gap-2">
                <HomeIcon />
                <span>Inicio</span>
              </Win98Button>
            </Link>
            <Link href="/blog">
              <Win98Button className="flex items-center gap-2">
                <BackIcon />
                <span>Wikidólar</span>
              </Win98Button>
            </Link>
          </nav>

          {/* Article Window */}
          <Win98Window
            title={post.title}
            icon={<ArticleIcon />}
            className="w-full max-w-2xl"
          >
            <div className="bg-win-gray p-4">
              {/* Article meta */}
              <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b-2 border-gray-400">
                <time className="text-xs text-gray-600 font-retro">
                  {formatDate(post.date)}
                </time>
                <span className="text-gray-400">•</span>
                <span className="text-xs text-gray-600 font-retro">
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

              {/* Article content */}
              <article 
                className="prose prose-sm max-w-none bg-white border-2 p-4 font-retro
                  prose-headings:font-retro prose-headings:text-win-blue
                  prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3
                  prose-h3:text-base prose-h3:mt-4 prose-h3:mb-2
                  prose-p:text-gray-800 prose-p:leading-relaxed prose-p:mb-3
                  prose-strong:text-win-blue
                  prose-a:text-blue-800 prose-a:underline
                  prose-ul:my-2 prose-ul:pl-4
                  prose-ol:my-2 prose-ol:pl-4
                  prose-li:my-1
                  prose-table:border-collapse prose-table:w-full
                  prose-th:bg-win-gray prose-th:border prose-th:border-gray-400 prose-th:p-2 prose-th:text-left
                  prose-td:border prose-td:border-gray-300 prose-td:p-2
                  prose-hr:my-6 prose-hr:border-gray-300
                  prose-blockquote:border-l-4 prose-blockquote:border-win-teal prose-blockquote:pl-4 prose-blockquote:italic"
                style={{ borderColor: '#000 #fff #fff #000' }}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Back to blog */}
              <div className="mt-6 flex justify-center">
                <Link href="/blog">
                  <Win98Button className="flex items-center gap-2">
                    <BackIcon />
                    <span>Volver a Wikidólar</span>
                  </Win98Button>
                </Link>
              </div>
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
