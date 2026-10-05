import type { MetadataRoute } from 'next';
import { buildSitemap } from '@/lib/seo/sitemap';

/** Revalidate hourly so new blog posts appear without a full rebuild. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap();
}
