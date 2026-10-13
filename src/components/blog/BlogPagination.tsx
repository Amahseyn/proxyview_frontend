import Link from 'next/link';
import { blogCategoryPath } from '@/lib/seo/categories';

type Props = {
  currentPage: number;
  pageCount: number;
  categorySlug?: string;
};

function blogListHref(page: number, categorySlug?: string): string {
  if (categorySlug) {
    return blogCategoryPath(categorySlug, page > 1 ? page : undefined);
  }
  if (page > 1) return `/blog?page=${page}`;
  return '/blog';
}

export default function BlogPagination({ currentPage, pageCount, categorySlug }: Props) {
  if (pageCount <= 1) return null;

  return (
    <nav className="blog-pagination" aria-label="Blog pages">
      {currentPage > 1 ? (
        <Link href={blogListHref(currentPage - 1, categorySlug)} className="btn btn-outline blog-pagination-btn">
          Previous
        </Link>
      ) : (
        <span className="btn btn-outline blog-pagination-btn blog-pagination-btn--disabled" aria-disabled="true">
          Previous
        </span>
      )}
      <span className="blog-pagination-status">
        Page {currentPage} of {pageCount}
      </span>
      {currentPage < pageCount ? (
        <Link href={blogListHref(currentPage + 1, categorySlug)} className="btn btn-outline blog-pagination-btn">
          Next
        </Link>
      ) : (
        <span className="btn btn-outline blog-pagination-btn blog-pagination-btn--disabled" aria-disabled="true">
          Next
        </span>
      )}
    </nav>
  );
}
