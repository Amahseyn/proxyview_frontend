import type { MetadataRoute } from 'next';
import { getPosts } from '@/lib/posts.server';
import { getAbsoluteSiteUrl } from '@/lib/site';
import { BLOG_POST_SITEMAP, PUBLIC_STATIC_ROUTES } from '@/lib/seo/routes';

function joinUrl(base: string, path: string): string {
  if (path === '/') return base;
  return `${base}${path}`;
}

function parseLastModified(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Build the full sitemap entry list for all public, indexable pages. */
export async function buildSitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getAbsoluteSiteUrl();

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_STATIC_ROUTES.map((route) => ({
    url: joinUrl(baseUrl, route.path),
    lastModified: route.lastModified ? new Date(route.lastModified) : new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const posts = await getPosts();
  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: joinUrl(baseUrl, `/blog/${post.slug}`),
    lastModified:
      parseLastModified(post.updatedAt) ??
      parseLastModified(post.date) ??
      new Date(),
    changeFrequency: BLOG_POST_SITEMAP.changeFrequency,
    priority: BLOG_POST_SITEMAP.priority,
  }));

  return [...staticEntries, ...postEntries];
}

/** Human-readable report of included and excluded URLs for audits. */
export async function getSitemapReport(): Promise<{
  baseUrl: string;
  included: Array<{ url: string; source: 'static' | 'blog' }>;
  excluded: Array<{ pattern: string; reason: string }>;
}> {
  const baseUrl = getAbsoluteSiteUrl();
  const posts = await getPosts();

  return {
    baseUrl,
    included: [
      ...PUBLIC_STATIC_ROUTES.map((route) => ({
        url: joinUrl(baseUrl, route.path),
        source: 'static' as const,
      })),
      ...posts.map((post) => ({
        url: joinUrl(baseUrl, `/blog/${post.slug}`),
        source: 'blog' as const,
      })),
    ],
    excluded: [
      { pattern: '/admin/*', reason: 'Admin pages' },
      { pattern: '/api/*', reason: 'API routes' },
      { pattern: '/dashboard/*', reason: 'Dashboard pages (reserved)' },
      { pattern: '/auth/*', reason: 'Authentication pages (reserved)' },
      { pattern: '/blog?category=*', reason: 'Duplicate content — use /blog as canonical' },
      { pattern: 'draft/scheduled posts', reason: 'Unpublished blog posts' },
    ],
  };
}
