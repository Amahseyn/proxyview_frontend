import {
  buildCategorySitemap,
  buildPageSitemap,
  buildPostSitemap,
  renderSitemapIndex,
  renderUrlSet,
} from '@/lib/seo/sitemap';
import { getAbsoluteSiteUrl } from '@/lib/site';

export const SITEMAP_REVALIDATE_SECONDS = 3600;

export function sitemapXmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, max-age=0, s-maxage=${SITEMAP_REVALIDATE_SECONDS}, stale-while-revalidate`,
    },
  });
}

export async function buildSitemapIndexXml(): Promise<string> {
  const baseUrl = getAbsoluteSiteUrl();
  return renderSitemapIndex([
    `${baseUrl}/page-sitemap.xml`,
    `${baseUrl}/post-sitemap.xml`,
    `${baseUrl}/category-sitemap.xml`,
  ]);
}

export async function buildPageSitemapXml(): Promise<string> {
  return renderUrlSet(await buildPageSitemap());
}

export async function buildPostSitemapXml(): Promise<string> {
  return renderUrlSet(await buildPostSitemap());
}

export async function buildCategorySitemapXml(): Promise<string> {
  return renderUrlSet(await buildCategorySitemap());
}
