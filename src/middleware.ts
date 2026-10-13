import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isKnownCategorySlug } from '@/lib/seo/categories';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== '/blog') {
    return NextResponse.next();
  }

  const category = request.nextUrl.searchParams.get('category');
  if (!category) {
    return NextResponse.next();
  }

  const slug = category.trim().toLowerCase();
  if (!isKnownCategorySlug(slug)) {
    return NextResponse.next();
  }

  const destination = request.nextUrl.clone();
  destination.pathname = `/blog/category/${slug}`;
  destination.searchParams.delete('category');

  return NextResponse.redirect(destination, 308);
}

export const config = {
  matcher: '/blog',
};
