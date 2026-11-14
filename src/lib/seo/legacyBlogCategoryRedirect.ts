import { isKnownCategorySlug } from '@/lib/seo/categories';

/**
 * Resolves a permanent redirect for legacy `/blog?category=` URLs per SEO spec.
 * Returns destination pathname + search (without `category`), or null if no redirect.
 */
export function resolveLegacyBlogCategoryRedirect(
  pathname: string,
  searchParams: URLSearchParams
): { pathname: string; search: string } | null {
  if (pathname !== '/blog') return null;

  const category = searchParams.get('category');
  if (!category) return null;

  const next = new URLSearchParams(searchParams);
  next.delete('category');
  const search = next.toString();

  const slug = category.trim().toLowerCase();
  const pathnameOut = isKnownCategorySlug(slug) ? `/blog/category/${slug}` : '/blog';

  return {
    pathname: pathnameOut,
    search: search ? `?${search}` : '',
  };
}
