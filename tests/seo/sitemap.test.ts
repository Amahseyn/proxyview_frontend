import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Post } from '@/lib/types/post';
import { PUBLIC_STATIC_ROUTES } from '@/lib/seo/routes';

const mockGetPosts = vi.fn<() => Promise<Post[]>>();

vi.mock('@/lib/posts.server', () => ({
  getPosts: () => mockGetPosts(),
}));

import {
  buildCategorySitemap,
  buildPageSitemap,
  buildPostSitemap,
  getIndexableCategorySlugs,
  getSitemapReport,
  renderSitemapIndex,
} from '@/lib/seo/sitemap';
import {
  buildCategorySitemapXml,
  buildPageSitemapXml,
  buildPostSitemapXml,
  buildSitemapIndexXml,
} from '@/lib/seo/sitemapXml';

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
  blocksJson: '',
  faqJson: '',
  tocJson: '',
  categoryIds: [],
  categories: [],
  tagIds: [],
  tags: [],
  canonicalUrl: '',
  ogImage: '',
  seoNoIndex: false,
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

  it('includes all public static routes in the page sitemap', async () => {
    const entries = await buildPageSitemap();
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

  it('includes published blog posts in the post sitemap only', async () => {
    mockGetPosts.mockResolvedValue([samplePost]);

    const postEntries = await buildPostSitemap();
    const postUrls = postEntries.map((entry) => entry.url);

    expect(postUrls).toContain('https://proxyview.net/blog/seo-sitemap-post');
    expect(postUrls.some((url) => url.includes('/admin'))).toBe(false);
    expect(postUrls.some((url) => url.includes('/api'))).toBe(false);

    const pageUrls = (await buildPageSitemap()).map((entry) => entry.url);
    expect(pageUrls).not.toContain('https://proxyview.net/blog/seo-sitemap-post');
  });

  it('lists only populated category landing pages in the category sitemap', async () => {
    mockGetPosts.mockResolvedValue([
      samplePost,
      { ...samplePost, id: 2, slug: 'news-post', category: 'News' },
    ]);

    const slugs = await getIndexableCategorySlugs();
    expect(slugs).toEqual(['guides', 'news']);

    const categoryEntries = await buildCategorySitemap();
    const categoryUrls = categoryEntries.map((entry) => entry.url);

    expect(categoryUrls).toContain('https://proxyview.net/blog/category/guides');
    expect(categoryUrls).toContain('https://proxyview.net/blog/category/news');
    expect(categoryUrls).not.toContain('https://proxyview.net/blog/category/comparisons');
    expect(categoryUrls.some((url) => url.includes('?category='))).toBe(false);
  });

  it('renders sitemap index and child XML documents', async () => {
    mockGetPosts.mockResolvedValue([samplePost]);

    const indexXml = await buildSitemapIndexXml();
    expect(indexXml).toContain('<sitemapindex');
    expect(indexXml).toContain('https://proxyview.net/page-sitemap.xml');
    expect(indexXml).toContain('https://proxyview.net/post-sitemap.xml');
    expect(indexXml).toContain('https://proxyview.net/category-sitemap.xml');

    const pageXml = await buildPageSitemapXml();
    expect(pageXml).toContain('<urlset');
    expect(pageXml).toContain('https://proxyview.net/blog');

    const postXml = await buildPostSitemapXml();
    expect(postXml).toContain('https://proxyview.net/blog/seo-sitemap-post');

    const categoryXml = await buildCategorySitemapXml();
    expect(categoryXml).toContain('https://proxyview.net/blog/category/guides');
  });

  it('uses NEXT_PUBLIC_SITE_URL for absolute URLs', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://staging.proxyview.net';

    const entries = await buildPageSitemap();
    expect(entries[0].url).toBe('https://staging.proxyview.net');

    const indexXml = renderSitemapIndex(['https://staging.proxyview.net/page-sitemap.xml']);
    expect(indexXml).toContain('https://staging.proxyview.net/page-sitemap.xml');
  });

  it('reports included and excluded URLs for audits', async () => {
    mockGetPosts.mockResolvedValue([samplePost]);

    const report = await getSitemapReport();

    expect(report.baseUrl).toBe('https://proxyview.net');
    expect(report.included.length).toBe(PUBLIC_STATIC_ROUTES.length + 2);
    expect(report.included.some((item) => item.source === 'category')).toBe(true);
    expect(report.excluded.some((item) => item.pattern === '/admin/*')).toBe(true);
    expect(report.excluded.some((item) => item.pattern === '/api/*')).toBe(true);
    expect(report.excluded.some((item) => item.pattern === '/blog?category=*')).toBe(true);
  });
});
