import { describe, expect, it } from 'vitest';
import { buildPostMetadata, resolvePostMetaDescription, resolvePostMetaTitle } from '@/lib/postSeo';
import type { Post } from '@/lib/types/post';

const basePost: Post = {
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
  scheduledAt: null,
};

describe('Post SEO helpers', () => {
  it('falls back to post title and excerpt when meta fields are empty', () => {
    expect(resolvePostMetaTitle(basePost)).toBe('Test Post Title');
    expect(resolvePostMetaDescription(basePost)).toBe('Short excerpt for the post.');
  });

  it('uses custom meta fields when provided', () => {
    const post = {
      ...basePost,
      metaTitle: 'Custom Google Title',
      metaDescription: 'Custom Google description for search results.',
    };

    expect(resolvePostMetaTitle(post)).toBe('Custom Google Title');
    expect(resolvePostMetaDescription(post)).toBe('Custom Google description for search results.');
  });

  it('builds metadata with absolute title when meta title is set', () => {
    const metadata = buildPostMetadata({
      ...basePost,
      metaTitle: 'Best Proxy Guide 2026',
      metaDescription: 'Learn how to choose the best proxy provider.',
    });

    expect(metadata.title).toEqual({ absolute: 'Best Proxy Guide 2026' });
    expect(metadata.description).toBe('Learn how to choose the best proxy provider.');
    expect(metadata.alternates?.canonical).toBe('/blog/test-post');
    expect(metadata.openGraph?.title).toBe('Best Proxy Guide 2026');
    expect(metadata.openGraph?.url).toBe('/blog/test-post');
  });

  it('builds metadata with template title when meta title is empty', () => {
    const metadata = buildPostMetadata(basePost);

    expect(metadata.title).toBe('Test Post Title');
    expect(metadata.description).toBe('Short excerpt for the post.');
  });
});
