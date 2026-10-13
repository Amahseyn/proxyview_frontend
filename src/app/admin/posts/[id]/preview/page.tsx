'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getPost, type Post } from '@/lib/api';

export default function AdminPostPreviewPage() {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getPost(params.id, true);
      setPost(data);
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return <div className="container admin-loading">Loading preview…</div>;
  }

  if (!post) {
    return <div className="container admin-empty-state">Post not found.</div>;
  }

  return (
    <section className="post-single">
      <div className="container">
        <div className="post-single-inner post-single-card">
          <div className="action-buttons" style={{ marginBottom: 16 }}>
            <Link href={`/admin/posts/${post.id}/edit`} className="btn btn-outline admin-btn-sm">← Back to edit</Link>
            {post.status === 'published' && (
              <Link href={`/blog/${post.slug}`} target="_blank" className="btn btn-primary admin-btn-sm">View live ↗</Link>
            )}
          </div>
          <div className="post-single-meta">
            <span className="post-single-category">{post.category}</span>
            <span>{post.author}</span>
            <span>·</span>
            <span>{post.date}</span>
            <span>·</span>
            <span className={`post-status-badge post-status-badge--${post.status}`}>{post.status}</span>
          </div>
          <h1>{post.title}</h1>
          <div className="post-single-content">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </div>
      </div>
    </section>
  );
}
