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

export function resolvePostCanonicalPath(post: Pick<Post, 'canonicalUrl' | 'slug'>): string {
  const custom = post.canonicalUrl?.trim() ?? '';
  if (!custom) return `/blog/${post.slug}`;
  if (custom.startsWith('/')) return custom;
  return custom;
}

export function resolvePostOgImage(post: Pick<Post, 'ogImage' | 'thumbnail'>): string | undefined {
  const og = post.ogImage?.trim() ?? '';
  if (og) return og;
  if (post.thumbnail?.trim()) return post.thumbnail;
  return undefined;
}

export function buildPostMetadata(post: Post): Metadata {
  const title = resolvePostMetaTitle(post);
  const description = resolvePostMetaDescription(post);
  const hasCustomTitle = Boolean(post.metaTitle.trim());
  const canonicalPath = resolvePostCanonicalPath(post);
  const ogImage = resolvePostOgImage(post);

  return {
    title: hasCustomTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    robots: post.seoNoIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalPath,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}
