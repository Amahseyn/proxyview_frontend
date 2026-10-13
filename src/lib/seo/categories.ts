/** Map URL slugs (lowercase) to stored post category names. */
const CATEGORY_SLUG_MAP: Record<string, string> = {
  guides: 'Guides',
  comparisons: 'Comparisons',
  research: 'Research',
  reviews: 'Reviews',
  news: 'News',
};

/** Public blog nav order (matches footer category links). */
export const BLOG_CATEGORIES: { slug: string; name: string; intro: string }[] = [
  {
    slug: 'guides',
    name: 'Guides',
    intro: 'Step-by-step guides on proxies, anti-detect browsers, and web scraping workflows.',
  },
  {
    slug: 'comparisons',
    name: 'Comparisons',
    intro: 'Side-by-side comparisons of proxy providers, browsers, and tooling we test in the lab.',
  },
  {
    slug: 'research',
    name: 'Research',
    intro: 'Deep dives and data-backed research on detection, fingerprinting, and network behavior.',
  },
  {
    slug: 'reviews',
    name: 'Reviews',
    intro: 'Hands-on reviews of proxy and anti-detect products based on real-world use cases.',
  },
  {
    slug: 'news',
    name: 'News',
    intro: 'Product updates, industry news, and announcements from the ProxyView team.',
  },
];

export function isKnownCategorySlug(slug: string): boolean {
  const normalized = slug.trim().toLowerCase();
  return normalized in CATEGORY_SLUG_MAP;
}

export function getCategoryFromSlug(slug: string): (typeof BLOG_CATEGORIES)[number] | undefined {
  const normalized = slug.trim().toLowerCase();
  const name = CATEGORY_SLUG_MAP[normalized];
  if (!name) return undefined;
  return BLOG_CATEGORIES.find((category) => category.slug === normalized);
}

/** Canonical path for a category landing page (optional paginated query). */
export function blogCategoryPath(slug: string, page?: number): string {
  const base = `/blog/category/${slug}`;
  if (page && page > 1) return `${base}?page=${page}`;
  return base;
}

/** Convert a blog category query param to the database category name. */
export function resolveCategorySlug(slug?: string): string | undefined {
  if (!slug?.trim()) return undefined;
  const normalized = slug.trim().toLowerCase();
  return CATEGORY_SLUG_MAP[normalized] ?? slug;
}

/** URL slug for a stored category label (e.g. Guides → guides). */
export function categoryNameToSlug(name: string): string {
  const normalized = name.trim().toLowerCase();
  const fromMap = Object.entries(CATEGORY_SLUG_MAP).find(([, label]) => label.toLowerCase() === normalized);
  if (fromMap) return fromMap[0];
  return normalized.replace(/\s+/g, '-');
}
