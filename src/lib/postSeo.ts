import type { Metadata } from 'next';
import type { Post } from '@/lib/types/post';

export const META_TITLE_MAX = 60;
export const META_DESCRIPTION_MAX = 160;

export function resolvePostMetaTitle(post: Pick<Post, 'metaTitle' | 'title'>): string {
  return post.metaTitle.trim() || post.title;
}

export function resolvePostMetaDescription(
  post: Pick<Post, 'metaDescription' | 'excerpt' | 'title'>
): string {
  return post.metaDescription.trim() || post.excerpt.trim() || `${post.title} on ProxyView`;
}

export function buildPostMetadata(post: Post): Metadata {
  const title = resolvePostMetaTitle(post);
  const description = resolvePostMetaDescription(post);
  const hasCustomTitle = Boolean(post.metaTitle.trim());
  const canonicalPath = `/blog/${post.slug}`;

  return {
    title: hasCustomTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalPath,
      ...(post.thumbnail ? { images: [{ url: post.thumbnail }] } : {}),
    },
    twitter: {
      card: post.thumbnail ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(post.thumbnail ? { images: [post.thumbnail] } : {}),
    },
  };
}
