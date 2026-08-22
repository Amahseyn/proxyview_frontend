import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getPost, getPosts } from '@/lib/api';

type Props = { params: Promise<{ slug: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Post Not Found — ProxyView' };
  return {
    title: `${post.title} | ProxyView`,
    description: post.excerpt || `${post.title} on ProxyView`,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  // Helper to check if content contains HTML tags
  const isHtml = /<[a-z][\s\S]*>/i.test(post.content || '');

  return (
    <section className="post-single">
      <div className="container">
        <div className="post-single-inner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <Link href="/blog" className="post-back" style={{ margin: 0 }}>
              ← Back to Blog
            </Link>
            <Link
              href={`/admin/posts/${post.id}/edit`}
              style={{
                fontSize: '13px',
                fontFamily: 'var(--font-ui)',
                color: 'var(--primary)',
                background: 'rgba(255, 227, 0, 0.25)',
                padding: '5px 12px',
                borderRadius: '6px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              ✏️ Edit Post in Admin
            </Link>
          </div>

          <div className="post-single-meta">
            {post.category && <span className="post-single-category">{post.category}</span>}
            <span>{post.author || 'wm'}</span>
            <span>·</span>
            <span>{post.date}</span>
          </div>

          <h1>{post.title}</h1>

          {/* Featured Image if present */}
          {post.thumbnail && (
            <div style={{ margin: '28px 0', borderRadius: '12px', overflow: 'hidden', maxHeight: '440px', background: '#f1f5f9' }}>
              <Image
                src={post.thumbnail}
                alt={post.title}
                width={800}
                height={420}
                unoptimized
                style={{ width: '100%', maxHeight: '440px', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Post Content */}
          <div className="post-single-content">
            {isHtml ? (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : (
              // Fallback for markdown-style legacy posts
              post.content.split('\n\n').map((para, i) => {
                if (para.startsWith('## ')) {
                  return <h2 key={i}>{para.replace('## ', '')}</h2>;
                }
                if (para.startsWith('### ')) {
                  return <h3 key={i}>{para.replace('### ', '')}</h3>;
                }
                if (para.startsWith('**') && para.endsWith('**')) {
                  return <p key={i}><strong>{para.replace(/\*\*/g, '')}</strong></p>;
                }
                return <p key={i}>{para}</p>;
              })
            )}
          </div>

          {/* Bottom Back Button */}
          <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
            <Link href="/blog" className="btn btn-outline" style={{ padding: '10px 24px' }}>
              ← Return to All Articles
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
