/** Map URL slugs (lowercase) to stored post category names. */
const CATEGORY_SLUG_MAP: Record<string, string> = {
  guides: 'Guides',
  comparisons: 'Comparisons',
  research: 'Research',
  reviews: 'Reviews',
  news: 'News',
};

/** Convert a blog category query param to the database category name. */
export function resolveCategorySlug(slug?: string): string | undefined {
  if (!slug?.trim()) return undefined;
  const normalized = slug.trim().toLowerCase();
  return CATEGORY_SLUG_MAP[normalized] ?? slug;
}
