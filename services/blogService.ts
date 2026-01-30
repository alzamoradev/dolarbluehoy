import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';
import { BlogPostMeta, BlogPost } from '@/types';

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

// Obtener todos los slugs de artículos
export function getAllPostSlugs(): string[] {
  try {
    const files = fs.readdirSync(BLOG_DIR);
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace(/\.md$/, ''));
  } catch {
    return [];
  }
}

// Obtener metadata de todos los artículos (para listados)
export function getAllPostsMeta(): BlogPostMeta[] {
  const slugs = getAllPostSlugs();
  
  const posts = slugs.map(slug => {
    const filePath = path.join(BLOG_DIR, `${slug}.md`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);
    
    return {
      slug,
      title: data.title || slug,
      description: data.description || '',
      date: data.date || new Date().toISOString().split('T')[0],
      author: data.author || 'Wikidólar',
      tags: data.tags || [],
      image: data.image,
    };
  });
  
  // Ordenar por fecha descendente (más reciente primero)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Obtener un artículo completo por slug
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const filePath = path.join(BLOG_DIR, `${slug}.md`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    
    // Convertir markdown a HTML
    const processedContent = await remark()
      .use(gfm)
      .use(html)
      .process(content);
    const contentHtml = processedContent.toString();
    
    return {
      slug,
      title: data.title || slug,
      description: data.description || '',
      date: data.date || new Date().toISOString().split('T')[0],
      author: data.author || 'Wikidólar',
      tags: data.tags || [],
      image: data.image,
      content: contentHtml,
    };
  } catch {
    return null;
  }
}

// Obtener los últimos N artículos (para widget en homepage)
export function getLatestPosts(count: number = 3): BlogPostMeta[] {
  const allPosts = getAllPostsMeta();
  return allPosts.slice(0, count);
}
