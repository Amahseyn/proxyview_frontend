import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostCard from '@/components/BlogPostCard';
import BlogCategoryNav from '@/components/blog/BlogCategoryNav';
import JsonLd from '@/components/seo/JsonLd';
import BlogPagination from '@/components/blog/BlogPagination';
import { getBlogListPage } from '@/lib/posts.server';
import { blogCategoryPath, getCategoryFromSlug } from '@/lib/seo/categories';
import { buildBlogCollectionPageJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo/jsonLd';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

function parseBlogPage(pageParam?: string): number {
  const parsed = Number.parseInt(pageParam ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryFromSlug(slug);
  if (!category) {
    return { title: 'Category not found — ProxyView' };
  }

  const pageNumber = parseBlogPage((await searchParams).page);
  const canonicalPath = blogCategoryPath(category.slug, pageNumber > 1 ? pageNumber : undefined);
  const { posts } = await getBlogListPage({ category: category.name, page: pageNumber });
  const hasContent = posts.length > 0;
  const allowIndex = hasContent && pageNumber === 1;

  return {
    title: `${category.name} — Blog — ProxyView`,
    description: category.intro,
    alternates: {
      canonical: canonicalPath,
    },
    ...(allowIndex ? {} : { robots: { index: false, follow: true } }),
  };
}

export const dynamic = 'force-dynamic';

export default async function BlogCategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = getCategoryFromSlug(slug);
  if (!category) {
    notFound();
  }

  const pageNumber = parseBlogPage((await searchParams).page);
  const categoryPath = blogCategoryPath(category.slug);
  const { posts, page: currentPage, pageCount } = await getBlogListPage({
    category: category.name,
    page: pageNumber,
  });

  return (
    <>
      <JsonLd
        data={[
          buildBlogCollectionPageJsonLd(posts, category.intro, {
            path: categoryPath,
            name: `${category.name} — ProxyView Blog`,
          }),
          buildBreadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: category.name, path: categoryPath },
          ]),
        ]}
      />
      <div className="page-hero">
        <div className="container">
          <h1>{category.name}</h1>
          <p>{category.intro}</p>
        </div>
      </div>
      <section className="blog-page">
        <div className="container">
          <BlogCategoryNav activeCategory={category.name} />

          {posts.length === 0 ? (
            <div className="blog-category-prompt">
              <p>No posts in {category.name} yet.</p>
            </div>
          ) : (
            <>
              <div className="blog-grid blog-grid--category">
                {posts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>
              <BlogPagination
                currentPage={currentPage}
                pageCount={pageCount}
                categorySlug={category.slug}
              />
            </>
          )}
        </div>
      </section>
    </>
  );
}
