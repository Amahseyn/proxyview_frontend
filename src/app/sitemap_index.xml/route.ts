import { buildSitemapIndexXml, sitemapXmlResponse } from '@/lib/seo/sitemapXml';

export const revalidate = 3600;

export async function GET() {
  return sitemapXmlResponse(await buildSitemapIndexXml());
}
