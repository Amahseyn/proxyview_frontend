import { describe, expect, it } from 'vitest';
import {
  blogCategoryPath,
  categoryNameToSlug,
  getCategoryFromSlug,
  isKnownCategorySlug,
  resolveCategorySlug,
} from '@/lib/seo/categories';

describe('Blog category slug resolution', () => {
  it('maps lowercase URL slugs to stored category names', () => {
    expect(resolveCategorySlug('guides')).toBe('Guides');
    expect(resolveCategorySlug('comparisons')).toBe('Comparisons');
    expect(resolveCategorySlug('research')).toBe('Research');
    expect(resolveCategorySlug('reviews')).toBe('Reviews');
  });

  it('returns undefined for empty values', () => {
    expect(resolveCategorySlug()).toBeUndefined();
    expect(resolveCategorySlug('')).toBeUndefined();
    expect(resolveCategorySlug('   ')).toBeUndefined();
  });

  it('passes through unknown values unchanged', () => {
    expect(resolveCategorySlug('Custom')).toBe('Custom');
  });

  it('maps category labels to URL slugs', () => {
    expect(categoryNameToSlug('Guides')).toBe('guides');
    expect(categoryNameToSlug('Comparisons')).toBe('comparisons');
  });

  it('builds canonical category paths', () => {
    expect(blogCategoryPath('guides')).toBe('/blog/category/guides');
    expect(blogCategoryPath('guides', 2)).toBe('/blog/category/guides?page=2');
    expect(isKnownCategorySlug('news')).toBe(true);
    expect(isKnownCategorySlug('unknown')).toBe(false);
    expect(getCategoryFromSlug('guides')?.name).toBe('Guides');
    expect(getCategoryFromSlug('not-a-category')).toBeUndefined();
  });
});
