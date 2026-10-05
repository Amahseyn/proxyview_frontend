import type { MetadataRoute } from 'next';

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

export interface PublicStaticRoute {
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
  /** Optional fixed last-modified date for static legal/info pages. */
  lastModified?: string;
}

/**
 * Public static pages eligible for sitemap indexing.
 * Add new public page routes here when creating new pages.
 */
export const PUBLIC_STATIC_ROUTES: readonly PublicStaticRoute[] = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/about_us', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.9, changeFrequency: 'daily' },
  { path: '/contact_us', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/glossary', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly', lastModified: '2026-01-01' },
  { path: '/proxy-checker', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/terms_conditions', priority: 0.3, changeFrequency: 'yearly', lastModified: '2026-01-01' },
];

/** Route patterns disallowed in robots.txt and excluded from the sitemap. */
export const ROBOTS_DISALLOW_PATHS = [
  '/admin/',
  '/api/',
  '/dashboard/',
  '/auth/',
] as const;

/**
 * Routes that must never appear in the sitemap, with exclusion reasons
 * (used for documentation and test assertions).
 */
export const EXCLUDED_ROUTES: ReadonlyArray<{ pattern: string; reason: string }> = [
  { pattern: '/admin', reason: 'Admin dashboard' },
  { pattern: '/admin/login', reason: 'Authentication page' },
  { pattern: '/admin/glossary', reason: 'Admin CMS' },
  { pattern: '/admin/messages', reason: 'Admin internal inbox' },
  { pattern: '/admin/posts/new', reason: 'Admin CMS create' },
  { pattern: '/admin/posts/*/edit', reason: 'Admin CMS edit' },
  { pattern: '/api/*', reason: 'API route' },
  { pattern: '/blog?category=*', reason: 'Filtered blog view (canonical: /blog)' },
];

/** Blog post dynamic route settings for the sitemap. */
export const BLOG_POST_SITEMAP = {
  priority: 0.7,
  changeFrequency: 'weekly' as ChangeFrequency,
};
