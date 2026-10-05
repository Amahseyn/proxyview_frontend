import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Post } from '@/lib/types/post';
import { PUBLIC_STATIC_ROUTES } from '@/lib/seo/routes';

const mockGetPosts = vi.fn<() => Promise<Post[]>>();

vi.mock('@/lib/posts.server', () => ({
  getPosts: () => mockGetPosts(),
}));

import { buildSitemap, getSitemapReport } from '@/lib/seo/sitemap';

const samplePost: Post = {
  id: 1,
  slug: 'seo-sitemap-post',
  title: 'SEO Sitemap Post',
  excerpt: 'Excerpt',
  content: '<p>Content</p>',
  category: 'Guides',
  author: 'wm',
  date: 'September 28, 2026',
  thumbnail: '',
  metaTitle: '',
  metaDescription: '',
  status: 'published',
  updatedAt: '2026-09-28T00:00:00.000Z',
};

describe('Sitemap generation', () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://proxyview.net';
    mockGetPosts.mockResolvedValue([]);
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    vi.clearAllMocks();
  });

  it('includes all public static routes with required sitemap fields', async () => {
    const entries = await buildSitemap();
    const urls = entries.map((entry) => entry.url);

    for (const route of PUBLIC_STATIC_ROUTES) {
      const expected = route.path === '/' ? 'https://proxyview.net' : `https://proxyview.net${route.path}`;
      expect(urls).toContain(expected);
    }

    for (const entry of entries) {
      expect(entry.url).toMatch(/^https:\/\//);
      expect(entry.lastModified).toBeInstanceOf(Date);
      expect(entry.changeFrequency).toBeTruthy();
      expect(entry.priority).toBeGreaterThan(0);
      expect(entry.priority).toBeLessThanOrEqual(1);
    }
  });

  it('includes published blog posts and excludes admin/api routes', async () => {
    mockGetPosts.mockResolvedValue([samplePost]);

    const entries = await buildSitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain('https://proxyview.net/blog/seo-sitemap-post');
    expect(urls.some((url) => url.includes('/admin'))).toBe(false);
    expect(urls.some((url) => url.includes('/api'))).toBe(false);
  });

  it('uses NEXT_PUBLIC_SITE_URL for absolute URLs', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://staging.proxyview.net';

    const entries = await buildSitemap();
    expect(entries[0].url).toBe('https://staging.proxyview.net');
  });

  it('reports included and excluded URLs for audits', async () => {
    mockGetPosts.mockResolvedValue([samplePost]);

    const report = await getSitemapReport();

    expect(report.baseUrl).toBe('https://proxyview.net');
    expect(report.included.length).toBe(PUBLIC_STATIC_ROUTES.length + 1);
    expect(report.excluded.some((item) => item.pattern === '/admin/*')).toBe(true);
    expect(report.excluded.some((item) => item.pattern === '/api/*')).toBe(true);
  });
});
