import { describe, expect, it } from 'vitest';
import { resolveLegacyBlogCategoryRedirect } from '@/lib/seo/legacyBlogCategoryRedirect';

describe('resolveLegacyBlogCategoryRedirect', () => {
  it('returns null when pathname is not /blog or category param is absent', () => {
    expect(resolveLegacyBlogCategoryRedirect('/blog', new URLSearchParams())).toBeNull();
    expect(resolveLegacyBlogCategoryRedirect('/blog/category/guides', new URLSearchParams('category=guides'))).toBeNull();
  });

  it('301 target for known categories (canonical paths)', () => {
    expect(resolveLegacyBlogCategoryRedirect('/blog', new URLSearchParams('category=guides'))).toEqual({
      pathname: '/blog/category/guides',
      search: '',
    });
    expect(resolveLegacyBlogCategoryRedirect('/blog', new URLSearchParams('category=Guides&page=2'))).toEqual({
      pathname: '/blog/category/guides',
      search: '?page=2',
    });
  });

  it('strips unknown category params to /blog', () => {
    expect(resolveLegacyBlogCategoryRedirect('/blog', new URLSearchParams('category=unknown'))).toEqual({
      pathname: '/blog',
      search: '',
    });
  });
});
