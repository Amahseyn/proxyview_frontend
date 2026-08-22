import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getPosts } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Blog — ProxyView',
  description: 'Guides, comparisons, and research on proxies, anti-detect browsers, and web scraping from the ProxyView team.',
};

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
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
              <p style={{ fontSize: '18px', color: '#64748b' }}>No posts published yet.</p>
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
