'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminAlert from '@/components/admin/AdminAlert';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { filterAdminPosts, getPostCategories } from '@/lib/admin/postForm';
import { formatScheduledAt, getPostStatusLabel, isPostPublic } from '@/lib/postStatus';
import { deletePost, getContactMessages, getPosts, Post } from '@/lib/api';

function StatusBadge({ post }: { post: Post }) {
  const label = getPostStatusLabel(post.status);
  const className = `post-status-badge post-status-badge--${post.status}`;

  if (post.status === 'scheduled' && post.scheduledAt) {
    const isLive = isPostPublic(post);
    return (
      <span className={className}>
        {isLive ? 'Published' : label}
        <span className="post-status-meta">
          {isLive ? `Went live ${formatScheduledAt(post.scheduledAt)}` : formatScheduledAt(post.scheduledAt)}
        </span>
      </span>
    );
  }

  return <span className={className}>{label}</span>;
}

export default function AdminDashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      try {
        const [postsData, messagesData] = await Promise.all([
          getPosts({ admin: true }),
          getContactMessages(),
        ]);
        setPosts(postsData);
        setMessageCount(messagesData.length);
      } catch (err) {
        console.error('Failed to load posts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  const filteredPosts = useMemo(
    () => filterAdminPosts(posts, searchQuery, selectedCategory, selectedStatus),
    [posts, searchQuery, selectedCategory, selectedStatus]
  );

  const categories = useMemo(() => getPostCategories(posts), [posts]);

  const statusCounts = useMemo(() => ({
    draft: posts.filter(p => p.status === 'draft').length,
    scheduled: posts.filter(p => p.status === 'scheduled' && !isPostPublic(p)).length,
    published: posts.filter(p => isPostPublic(p)).length,
  }), [posts]);

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deletePost(postToDelete.id);
      if (res.success) {
        setNotification({ type: 'success', message: `Post "${postToDelete.title}" was deleted.` });
        setPosts(prev => prev.filter(p => p.id !== postToDelete.id));
        setPostToDelete(null);
      } else {
        setNotification({ type: 'error', message: res.message || 'Failed to delete post.' });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error deleting post.';
      setNotification({ type: 'error', message });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  return (
    <div className="container">
      {notification && (
        <AdminAlert
          type={notification.type}
          message={notification.message}
          onDismiss={() => setNotification(null)}
        />
      )}

      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h4>Total Posts</h4>
            <div className="stat-number">{posts.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📢</div>
          <div className="stat-info">
            <h4>Published</h4>
            <div className="stat-number">{statusCounts.published}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🕒</div>
          <div className="stat-info">
            <h4>Scheduled</h4>
            <div className="stat-number">{statusCounts.scheduled}</div>
          </div>
        </div>
        <Link href="/admin/messages" className="stat-card stat-card-link">
          <div className="stat-icon">✉️</div>
          <div className="stat-info">
            <h4>Contact Messages</h4>
            <div className="stat-number">{messageCount}</div>
          </div>
        </Link>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h1 className="admin-card-title">Blog Posts</h1>
            <p className="admin-card-subtitle">Create drafts, publish immediately, or schedule posts for later.</p>
          </div>
          <Link href="/admin/posts/new" className="btn btn-primary admin-btn-sm">
            + Add New Post
          </Link>
        </div>

        <div className="admin-filter-panel">
          <div className="admin-filter-bar">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="admin-select"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>Category: {cat}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="admin-select"
            >
              <option value="All">Status: All</option>
              <option value="draft">Status: Draft</option>
              <option value="scheduled">Status: Scheduled</option>
              <option value="published">Status: Published</option>
            </select>
            <span className="admin-filter-count">
              Showing <strong>{filteredPosts.length}</strong> of {posts.length}
            </span>
          </div>
        </div>

        <div className="admin-table-wrapper">
          {loading ? (
            <div className="admin-loading">Loading posts...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="admin-empty-state">
              <p className="admin-empty-title">No posts found</p>
              <p className="admin-empty-desc">Adjust your filters or create a new post.</p>
              <Link href="/admin/posts/new" className="btn btn-primary admin-btn-sm">
                + Create Post
              </Link>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Image</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map(post => (
                  <tr key={post.id}>
                    <td>
                      <div className="post-thumb-cell">
                        {post.thumbnail ? (
                          <Image
                            src={post.thumbnail}
                            alt={post.title}
                            width={70}
                            height={48}
                            unoptimized
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <span>📄</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="post-title-cell">
                        <Link href={`/admin/posts/${post.id}/edit`}>{post.title}</Link>
                      </div>
                      <div className="post-slug">/{post.slug}</div>
                    </td>
                    <td><StatusBadge post={post} /></td>
                    <td><span className="post-category-tag">{post.category || 'Guides'}</span></td>
                    <td>{post.author || 'wm'}</td>
                    <td>{post.date}</td>
                    <td>
                      <div className="action-buttons">
                        {isPostPublic(post) && (
                          <Link href={`/blog/${post.slug}`} target="_blank" className="action-btn action-btn-view">
                            View
                          </Link>
                        )}
                        <Link href={`/admin/posts/${post.id}/edit`} className="action-btn action-btn-edit">
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setPostToDelete(post)}
                          className="action-btn action-btn-delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {postToDelete && (
        <ConfirmModal
          title="Delete Post?"
          description={
            <>
              Permanently delete <strong>&quot;{postToDelete.title}&quot;</strong>? This cannot be undone.
            </>
          }
          confirmLabel="Delete Post"
          loadingLabel="Deleting..."
          isLoading={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPostToDelete(null)}
        />
      )}
    </div>
  );
}
