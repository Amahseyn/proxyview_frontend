import { describe, expect, it } from 'vitest';
import { resolveCategorySlug } from '@/lib/seo/categories';

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
});
