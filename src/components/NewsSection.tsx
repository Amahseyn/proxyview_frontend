import Link from 'next/link';
import { getPosts } from '@/lib/posts.server';

export default async function NewsSection() {
  const posts = await getPosts({ limit: 6 });

  return (
    <section className="news section">
      <div className="container">
        <div className="section-header">
          <h2>News in Proxy and Anti Detect Bot Industry</h2>
        </div>
        <p className="section-subheader">
          Stay up to date with the latest guides, comparisons, and research from the ProxyView team.
        </p>
        <div className="news-grid">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="news-card">
              <h3 className="news-card-title">{post.title}</h3>
              <p className="news-card-excerpt">{post.excerpt}</p>
              <span className="news-card-read">Read More »</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
