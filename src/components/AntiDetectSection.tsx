import Image from 'next/image';
import Link from 'next/link';
import { getPosts } from '@/lib/posts.server';

export default async function AntiDetectSection() {
  const posts = await getPosts({ limit: 3 });

  return (
    <section className="antidetect section">
      <div className="container">
        <div className="section-header">
          <h2>Award Anti-Detect Browsers</h2>
        </div>
        <p className="section-subheader">
          Our top-rated anti-detect browser picks based on hands-on testing, feature depth, and real-world performance.
        </p>
        <div className="antidetect-grid">
          {posts.map(post => (
            <div key={post.id} className="antidetect-card">
              <div className="antidetect-card-thumb">
                <Image
                  src={post.thumbnail || '/images/blog/web-scraping.jpg'}
                  alt={post.title}
                  width={470}
                  height={300}
                  unoptimized
                />
                {post.category && <span className="antidetect-card-badge">{post.category}</span>}
              </div>
              <div className="antidetect-card-body">
                <p className="antidetect-card-meta">
                  <span>{post.author || 'wm'}</span>
                  <span>·</span>
                  <span>{post.date}</span>
                </p>
                <h3 className="antidetect-card-title">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="antidetect-card-excerpt">{post.excerpt}</p>
                <Link href={`/blog/${post.slug}`} className="antidetect-card-read">
                  Read More »
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
