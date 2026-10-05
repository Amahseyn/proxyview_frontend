'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import PostForm from '@/components/admin/PostForm';
import { postToFormValues } from '@/lib/admin/postForm';
import { isPostPublic } from '@/lib/postStatus';
import { getPost, updatePost, Post } from '@/lib/api';

type Props = {
  params: Promise<{ id: string }>;
};

export default function EditPostPage({ params }: Props) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getPost(id);
        if (data) {
          setPost(data);
        } else {
          setError('Post not found');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(`Error loading post: ${message}`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return <div className="container admin-loading">Loading post...</div>;
  }

  if (!post) {
    return (
      <div className="container admin-empty-state">
        <h2 className="admin-page-title">{error || 'Post Not Found'}</h2>
        <p className="admin-empty-desc">The post you requested could not be found.</p>
        <Link href="/admin" className="btn btn-primary">← Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <PostForm
      mode="edit"
      initialValues={postToFormValues(post)}
      headerTitle={<>Edit: <span className="form-label-muted">{post.title}</span></>}
      viewLiveSlug={post.slug}
      canViewLive={isPostPublic(post)}
      onSubmit={input => updatePost(id, input)}
    />
  );
}
