import Image from 'next/image';
import Link from 'next/link';

const posts = [
  {
    id: 1,
    slug: 'what-is-web-scraping',
    title: 'What is Web Scraping: A Clear Guide (Tools, API, Proxies)',
    excerpt: 'Web scraping is the automated collection of data from web pages and turning it into usable formats like CSV, JSON, or a database.',
    category: 'Guides',
    author: 'wm',
    date: 'September 14, 2025',
  },
  {
    id: 2,
    slug: 'how-to-get-around-an-ip-ban',
    title: 'How To Get Around An IP Ban In 2025 (Safe And Effective Guide)',
    excerpt: 'An IP ban happens when a website or platform blocks your device\'s IP address, cutting you off from access.',
    category: 'Guides',
    author: 'wm',
    date: 'September 14, 2025',
  },
  {
    id: 3,
    slug: 'web-telegram-login-and-features',
    title: 'Web Telegram Login And Features: Simple Guide For 2025',
    excerpt: 'Telegram is one of the world\'s most used messengers, but most people still think of it as a phone app.',
    category: 'Guides',
    author: 'wm',
    date: 'September 14, 2025',
  },
];

export default function AntiDetectSection() {
  return (
    <section className="antidetect section">
      <div className="container">
        <div className="antidetect-header">
          <h2>Award Anti-Detect Browsers</h2>
        </div>
        <p className="antidetect-subheader">
          Our top-rated anti-detect browser picks based on hands-on testing, feature depth, and real-world performance.
        </p>
        <div className="antidetect-grid">
          {posts.map(post => (
            <div key={post.id} className="antidetect-card">
              <div className="antidetect-card-thumb">
                <Image
                  src="/images/Untitled-470-x-300-px-300x191.png"
                  alt={post.title}
                  width={470}
                  height={300}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span className="antidetect-card-badge">{post.category}</span>
              </div>
              <div className="antidetect-card-body">
                <div className="antidetect-card-meta">
                  <div className="antidetect-card-avatar">
                    <Image
                      src="/images/230991fb8f66cb6c91f4a084417ee4bd530a7c74d988dac09f6379dda60f3324.jpg"
                      alt={post.author}
                      width={28}
                      height={28}
                    />
                  </div>
                  <span>{post.author}</span>
                  <span>·</span>
                  <span>{post.date}</span>
                </div>
                <h3 className="antidetect-card-title">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="antidetect-card-excerpt">{post.excerpt}</p>
                <Link href={`/blog/${post.slug}`} className="antidetect-card-read">Read More</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
