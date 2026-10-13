import type { MetadataRoute } from 'next';
import {
  BLOG_CATEGORIES,
  categoryNameToSlug,
  isKnownCategorySlug,
} from '@/lib/seo/categories';
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

function mapStaticEntries(): MetadataRoute.Sitemap {
  const baseUrl = getAbsoluteSiteUrl();
  return PUBLIC_STATIC_ROUTES.map((route) => ({
    url: joinUrl(baseUrl, route.path),
    lastModified: route.lastModified ? new Date(route.lastModified) : new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

function mapPostEntries(posts: Awaited<ReturnType<typeof getPosts>>): MetadataRoute.Sitemap {
  const baseUrl = getAbsoluteSiteUrl();
  return posts.map((post) => ({
    url: joinUrl(baseUrl, `/blog/${post.slug}`),
    lastModified:
      parseLastModified(post.updatedAt) ??
      parseLastModified(post.date) ??
      new Date(),
    changeFrequency: BLOG_POST_SITEMAP.changeFrequency,
    priority: BLOG_POST_SITEMAP.priority,
  }));
}

/** Category landing pages that have at least one published post. */
export async function getIndexableCategorySlugs(): Promise<string[]> {
  const posts = await getPosts();
  const populated = new Set<string>();

  for (const post of posts) {
    const slug = categoryNameToSlug(post.category);
    if (isKnownCategorySlug(slug)) {
      populated.add(slug);
    }
  }

  return BLOG_CATEGORIES.map((category) => category.slug).filter((slug) => populated.has(slug));
}

export async function buildPageSitemap(): Promise<MetadataRoute.Sitemap> {
  return mapStaticEntries();
}

export async function buildPostSitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  return mapPostEntries(posts);
}

export async function buildCategorySitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getAbsoluteSiteUrl();
  const slugs = await getIndexableCategorySlugs();

  return slugs.map((slug) => ({
    url: joinUrl(baseUrl, `/blog/category/${slug}`),
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));
}

/** @deprecated Use split sitemap builders for production XML routes. */
export async function buildSitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, posts, categories] = await Promise.all([
    buildPageSitemap(),
    buildPostSitemap(),
    buildCategorySitemap(),
  ]);
  return [...pages, ...posts, ...categories];
}

export function formatSitemapDate(date: Date): string {
  return date.toISOString();
}

export function renderUrlSet(entries: MetadataRoute.Sitemap): string {
  const urlNodes = entries
    .map((entry) => {
      const lastModified = entry.lastModified
        ? `\n    <lastmod>${formatSitemapDate(
            entry.lastModified instanceof Date ? entry.lastModified : new Date(entry.lastModified)
          )}</lastmod>`
        : '';
      const changeFrequency = entry.changeFrequency
        ? `\n    <changefreq>${entry.changeFrequency}</changefreq>`
        : '';
      const priority =
        entry.priority !== undefined ? `\n    <priority>${entry.priority}</priority>` : '';

      return `  <url>\n    <loc>${entry.url}</loc>${lastModified}${changeFrequency}${priority}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlNodes}\n</urlset>\n`;
}

export function renderSitemapIndex(locations: string[]): string {
  const nodes = locations
    .map((loc) => `  <sitemap>\n    <loc>${loc}</loc>\n  </sitemap>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${nodes}\n</sitemapindex>\n`;
}

/** Human-readable report of included and excluded URLs for audits. */
export async function getSitemapReport(): Promise<{
  baseUrl: string;
  included: Array<{ url: string; source: 'static' | 'blog' | 'category' }>;
  excluded: Array<{ pattern: string; reason: string }>;
}> {
  const baseUrl = getAbsoluteSiteUrl();
  const posts = await getPosts();
  const categorySlugs = await getIndexableCategorySlugs();

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
      ...categorySlugs.map((slug) => ({
        url: joinUrl(baseUrl, `/blog/category/${slug}`),
        source: 'category' as const,
      })),
    ],
    excluded: [
      { pattern: '/admin/*', reason: 'Admin pages' },
      { pattern: '/api/*', reason: 'API routes' },
      { pattern: '/dashboard/*', reason: 'Dashboard pages (reserved)' },
      { pattern: '/auth/*', reason: 'Authentication pages (reserved)' },
      { pattern: '/blog?category=*', reason: 'Legacy filtered URLs — redirect to /blog/category/*' },
      { pattern: '/blog/category/* (empty)', reason: 'Category with no published posts' },
      { pattern: 'draft/scheduled posts', reason: 'Unpublished blog posts' },
    ],
  };
}
