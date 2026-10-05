import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { getPosts } from '@/lib/posts.server';
import { resolveCategorySlug } from '@/lib/seo/categories';
import { buildBlogCollectionPageJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo/jsonLd';

const BLOG_LIST_DESCRIPTION =
  'Guides, comparisons, and research on proxies, anti-detect browsers, and web scraping from the ProxyView team.';

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { category } = await searchParams;
  const hasCategoryFilter = Boolean(category);

  return {
    title: 'Blog — ProxyView',
    description: BLOG_LIST_DESCRIPTION,
    alternates: {
      canonical: '/blog',
    },
    ...(hasCategoryFilter ? { robots: { index: false, follow: true } } : {}),
  };
}

export const dynamic = 'force-dynamic';

export default async function BlogPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const resolvedCategory = resolveCategorySlug(category);
  const posts = await getPosts(resolvedCategory ? { category: resolvedCategory } : undefined);

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
          <p>Guides, comparisons, and research on proxies and anti-detect tools.</p>
        </div>
      </div>
      <section className="blog-page">
        <div className="container">
          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontSize: '18px', color: '#64748b' }}>
                {resolvedCategory ? `No posts in ${resolvedCategory} yet.` : 'No posts published yet.'}
              </p>
            </div>
          ) : (
            <div className="blog-grid">
              {posts.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-card-thumb">
                    {post.thumbnail ? (
                      <Image
                        src={post.thumbnail}
                        alt={post.title}
                        width={470}
                        height={300}
                        unoptimized
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#003135', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFE300', fontSize: '24px' }}>
                        ProxyView
                      </div>
                    )}
                    {post.category && <span className="post-card-badge">{post.category}</span>}
                  </div>
                  <div className="post-card-body">
                    <p className="post-card-meta">{post.author || 'wm'} · {post.date}</p>
                    <h3 className="post-card-title">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="post-card-excerpt">{post.excerpt}</p>
                    <Link href={`/blog/${post.slug}`} className="post-card-link">Read More »</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
