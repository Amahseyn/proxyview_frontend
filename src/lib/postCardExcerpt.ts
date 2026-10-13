import type { Post } from '@/lib/types/post';

export function getPostCardExcerpt(post: Pick<Post, 'excerpt' | 'content'>): string {
  const fromExcerpt = post.excerpt?.trim();
  if (fromExcerpt) return fromExcerpt;

  const plain = (post.content || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!plain) return '';

  const max = 180;
  return plain.length > max ? `${plain.slice(0, max).trimEnd()}…` : plain;
}
