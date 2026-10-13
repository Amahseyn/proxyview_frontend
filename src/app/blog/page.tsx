import type { Metadata } from 'next';
import BlogPostCard from '@/components/BlogPostCard';
import BlogCategoryNav from '@/components/blog/BlogCategoryNav';
import JsonLd from '@/components/seo/JsonLd';
import BlogPagination from '@/components/blog/BlogPagination';
import { getBlogListPage } from '@/lib/posts.server';
import { buildBlogCollectionPageJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo/jsonLd';

const BLOG_LIST_DESCRIPTION =
  'Guides, comparisons, and research on proxies, anti-detect browsers, and web scraping from the ProxyView team.';

type Props = {
  searchParams: Promise<{ page?: string }>;
};

function parseBlogPage(pageParam?: string): number {
  const parsed = Number.parseInt(pageParam ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const pageNumber = parseBlogPage((await searchParams).page);

  return {
    title: 'Blog — ProxyView',
    description: BLOG_LIST_DESCRIPTION,
    alternates: {
      canonical: '/blog',
    },
    ...(pageNumber > 1 ? { robots: { index: false, follow: true } } : {}),
  };
}

export const dynamic = 'force-dynamic';

export default async function BlogPage({ searchParams }: Props) {
  const pageNumber = parseBlogPage((await searchParams).page);
  const { posts, page: currentPage, pageCount } = await getBlogListPage({
    page: pageNumber,
  });

  return (
    <>
      <JsonLd
        data={[
          buildBlogCollectionPageJsonLd(posts, BLOG_LIST_DESCRIPTION),
          buildBreadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
          ]),
        ]}
      />
      <div className="page-hero">
        <div className="container">
          <h1>Blog</h1>
          <p>Latest articles across all categories. Filter by topic below.</p>
        </div>
      </div>
      <section className="blog-page">
        <div className="container">
          <BlogCategoryNav />

          {posts.length === 0 ? (
            <div className="blog-category-prompt">
              <p>No posts published yet.</p>
            </div>
          ) : (
            <>
              <div className="blog-grid blog-grid--category">
                {posts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>
              <BlogPagination currentPage={currentPage} pageCount={pageCount} />
            </>
          )}
        </div>
      </section>
    </>
  );
}
