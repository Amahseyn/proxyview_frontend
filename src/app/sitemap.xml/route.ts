import { NextResponse } from 'next/server';
import { getAbsoluteSiteUrl } from '@/lib/site';

/** Legacy robots entries and bookmarks — prefer sitemap_index.xml. */
export function GET() {
  const target = `${getAbsoluteSiteUrl()}/sitemap_index.xml`;
  return NextResponse.redirect(target, 308);
}
