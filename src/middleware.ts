import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resolveLegacyBlogCategoryRedirect } from '@/lib/seo/legacyBlogCategoryRedirect';

export function middleware(request: NextRequest) {
  const target = resolveLegacyBlogCategoryRedirect(
    request.nextUrl.pathname,
    request.nextUrl.searchParams
  );
  if (!target) {
    return NextResponse.next();
  }

  const destination = request.nextUrl.clone();
  destination.pathname = target.pathname;
  destination.search = target.search;

  return NextResponse.redirect(destination, 301);
}

export const config = {
  matcher: '/blog',
};
