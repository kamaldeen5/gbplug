import { createReader } from '@keystatic/core/reader';
import config from '../../keystatic.config';

export const reader = createReader(process.cwd(), config);

export interface BlogPostItem {
  slug: string;
  title: string;
  publishedDate: string;
  author: string;
  category: string;
  summary: string;
  coverImage: string | null;
}

export async function getAllPosts(): Promise<BlogPostItem[]> {
  try {
    const slugs = await reader.collections.posts.list();
    const list: BlogPostItem[] = [];

    for (const slug of slugs) {
      const post = await reader.collections.posts.read(slug);
      if (post && post.title) {
        list.push({
          slug,
          title: post.title,
          publishedDate: post.publishedDate || new Date().toISOString().split('T')[0],
          author: post.author || 'Kamal Deen',
          category: post.category || 'mtn',
          summary: post.summary || '',
          coverImage: post.coverImage || null,
        });
      }
    }

    return list.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
  } catch (error) {
    console.error('Error fetching blog posts from Keystatic:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const post = await reader.collections.posts.read(slug);
    if (!post) return null;

    const content = await post.content();
    return {
      slug,
      title: post.title,
      publishedDate: post.publishedDate || new Date().toISOString().split('T')[0],
      author: post.author || 'Kamal Deen',
      category: post.category || 'mtn',
      summary: post.summary || '',
      coverImage: post.coverImage || null,
      content,
    };
  } catch (error) {
    console.error(`Error fetching post for slug ${slug}:`, error);
    return null;
  }
}
