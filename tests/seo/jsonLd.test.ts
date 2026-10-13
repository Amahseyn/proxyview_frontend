import { afterEach, describe, expect, it } from 'vitest';
import { FAQ_ITEMS } from '@/lib/data/faqs';
import {
  buildBlogCollectionPageJsonLd,
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqPageJsonLd,
  buildOrganizationJsonLd,
  buildWebPageJsonLd,
  buildWebSiteJsonLd,
} from '@/lib/seo/jsonLd';
import type { Post } from '@/lib/types/post';

const samplePost: Post = {
  id: 1,
  slug: 'test-post',
  title: 'Test Post Title',
  excerpt: 'Short excerpt for the post.',
  content: '<p>Content</p>',
  category: 'Guides',
  author: 'wm',
  date: 'September 28, 2026',
  thumbnail: '/images/blog/web-scraping.jpg',
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
  createdAt: '2026-09-28T00:00:00.000Z',
  updatedAt: '2026-09-29T00:00:00.000Z',
};

describe('JSON-LD builders', () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  });

  it('builds Organization schema with site URL and logo', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://proxyview.net';
    const schema = buildOrganizationJsonLd();

    expect(schema['@type']).toBe('Organization');
    expect(schema.name).toBe('ProxyView');
    expect(schema.url).toBe('https://proxyview.net');
    expect(schema.logo).toBe('https://proxyview.net/images/PROXYVIEW_LOGO.png');
  });

  it('builds WebSite schema', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://proxyview.net';
    const schema = buildWebSiteJsonLd();

    expect(schema['@type']).toBe('WebSite');
    expect(schema.url).toBe('https://proxyview.net');
  });

  it('builds WebPage schema with absolute URL', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://proxyview.net';
    const schema = buildWebPageJsonLd({
      name: 'Home — ProxyView',
      description: 'Homepage description',
      path: '/',
    });

    expect(schema['@type']).toBe('WebPage');
    expect(schema.url).toBe('https://proxyview.net/');
  });

  it('builds FAQPage schema from shared FAQ data', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://proxyview.net';
    const schema = buildFaqPageJsonLd(FAQ_ITEMS);

    expect(schema['@type']).toBe('FAQPage');
    expect(schema.url).toBe('https://proxyview.net/faq');
    expect(schema.mainEntity).toHaveLength(FAQ_ITEMS.length);
    expect(schema.mainEntity[0]).toMatchObject({
      '@type': 'Question',
      name: FAQ_ITEMS[0].question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: FAQ_ITEMS[0].answer,
      },
    });
  });

  it('builds CollectionPage schema with blog post URLs', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://proxyview.net';
    const schema = buildBlogCollectionPageJsonLd(
      [{ slug: 'test-post', title: 'Test Post Title' }],
      'Blog listing description'
    );

    expect(schema['@type']).toBe('CollectionPage');
    expect(schema.url).toBe('https://proxyview.net/blog');
    const mainEntity = schema.mainEntity as { itemListElement: Array<{ url: string }> };
    expect(mainEntity.itemListElement[0].url).toBe('https://proxyview.net/blog/test-post');
  });

  it('builds BreadcrumbList schema with absolute URLs', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://proxyview.net';
    const schema = buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' },
    ]);

    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement[0].item).toBe('https://proxyview.net/');
    expect(schema.itemListElement[1].item).toBe('https://proxyview.net/blog');
  });

  it('builds BlogPosting schema with canonical URL and dates', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://proxyview.net';
    const schema = buildBlogPostingJsonLd(samplePost);

    expect(schema['@type']).toBe('BlogPosting');
    expect(schema.headline).toBe('Test Post Title');
    expect(schema.url).toBe('https://proxyview.net/blog/test-post');
    expect(schema.datePublished).toBe('2026-09-28T00:00:00.000Z');
    expect(schema.dateModified).toBe('2026-09-29T00:00:00.000Z');
    expect(schema.image).toBe('https://proxyview.net/images/blog/web-scraping.jpg');
    expect(schema.author).toEqual({ '@type': 'Person', name: 'wm' });
  });

  it('omits author from BlogPosting when not provided', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://proxyview.net';
    const schema = buildBlogPostingJsonLd({ ...samplePost, author: '' });

    expect(schema.author).toBeUndefined();
  });
});
