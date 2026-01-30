import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';
import { BlogPostMeta, BlogPost, FAQ } from '@/types';

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

// Extraer FAQs del contenido markdown
// Detecta headings (##, ###) que terminen en "?" y captura la respuesta
function extractFAQs(markdownContent: string): FAQ[] {
  const faqs: FAQ[] = [];
  const lines = markdownContent.split('\n');

  let currentQuestion: string | null = null;
  let currentAnswer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detectar heading que termine en "?"
    const questionMatch = line.match(/^#{2,4}\s+(.+\?)\s*$/);

    if (questionMatch) {
      // Si ya teníamos una pregunta, guardarla
      if (currentQuestion && currentAnswer.length > 0) {
        faqs.push({
          question: currentQuestion,
          answer: currentAnswer.join(' ').trim(),
        });
      }

      // Nueva pregunta
      currentQuestion = questionMatch[1];
      currentAnswer = [];
    } else if (currentQuestion) {
      // Si estamos dentro de una FAQ, acumular respuesta
      // Parar si encontramos otro heading
      if (line.match(/^#{1,4}\s+/)) {
        // Guardar FAQ actual
        if (currentAnswer.length > 0) {
          faqs.push({
            question: currentQuestion,
            answer: currentAnswer.join(' ').trim(),
          });
        }
        currentQuestion = null;
        currentAnswer = [];
      } else if (line.trim()) {
        // Agregar línea a la respuesta (ignorar líneas vacías)
        currentAnswer.push(line.trim());
      }
    }
  }

  // Guardar última FAQ si existe
  if (currentQuestion && currentAnswer.length > 0) {
    faqs.push({
      question: currentQuestion,
      answer: currentAnswer.join(' ').trim(),
    });
  }

  return faqs;
}

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

    // Extraer FAQs del markdown crudo
    const faqs = extractFAQs(content);

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
      faqs,
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
