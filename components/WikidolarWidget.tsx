'use client';

import Link from 'next/link';
import { Win98Window } from './RetroUI';
import { BlogPostMeta } from '@/types';

// Icon for the window
const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2 2h5v12H2V2zm7 0h5v12H9V2zm-6 1v10h3V3H3zm7 0v10h3V3h-3z" />
  </svg>
);

interface WikidolarWidgetProps {
  posts: BlogPostMeta[];
}

export const WikidolarWidget: React.FC<WikidolarWidgetProps> = ({ posts }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <Win98Window
      title="Wikidólar - Últimos Artículos"
      icon={<BookIcon />}
      className="w-full h-fit"
    >
      <div className="bg-win-gray p-2">
        {posts.length === 0 ? (
          <p className="text-gray-600 font-retro text-sm p-2">
            No hay artículos publicados todavía.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Scrollable container - Win98 style */}
            <div
              className="max-h-[280px] overflow-y-auto flex flex-col gap-2 pr-1"
              style={{
                scrollbarWidth: 'auto',
                scrollbarColor: '#808080 #c0c0c0'
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  width: 16px;
                }
                div::-webkit-scrollbar-track {
                  background: #c0c0c0;
                  border-left: 1px solid #808080;
                }
                div::-webkit-scrollbar-thumb {
                  background: #c0c0c0;
                  border: 2px solid;
                  border-color: #fff #000 #000 #fff;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background: #d4d4d4;
                }
                div::-webkit-scrollbar-button {
                  background: #c0c0c0;
                  border: 2px solid;
                  border-color: #fff #000 #000 #fff;
                  height: 16px;
                }
              `}</style>
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block bg-white border-2 p-2 hover:bg-blue-50 transition-colors flex-shrink-0"
                  style={{
                    borderColor: '#000 #fff #fff #000'
                  }}
                >
                  <article className="flex flex-col gap-1">
                    <h3 className="font-retro font-bold text-blue-800 hover:underline text-sm leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-600 font-retro line-clamp-2">
                      {post.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <time className="text-[10px] text-gray-500 font-retro">
                        {formatDate(post.date)}
                      </time>
                      {post.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="text-[10px] bg-win-teal text-white px-1 font-retro"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Ver todos los artículos */}
            <Link
              href="/blog"
              className="text-center text-blue-800 hover:underline font-retro text-xs py-2 border-t border-gray-400"
            >
              Ver todos los artículos →
            </Link>
          </div>
        )}
      </div>
    </Win98Window>
  );
};
