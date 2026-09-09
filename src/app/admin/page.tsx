'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminAlert from '@/components/admin/AdminAlert';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { filterAdminPosts, getPostCategories } from '@/lib/admin/postForm';
import { deletePost, getPosts, Post } from '@/lib/api';

export default function AdminDashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      try {
        setPosts(await getPosts());
      } catch (err) {
        console.error('Failed to load posts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  const filteredPosts = useMemo(
    () => filterAdminPosts(posts, searchQuery, selectedCategory),
    [posts, searchQuery, selectedCategory]
  );

  const categories = useMemo(() => getPostCategories(posts), [posts]);

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
          <div className="stat-icon">🏷️</div>
          <div className="stat-info">
            <h4>Categories</h4>
            <div className="stat-number">{categories.length - 1}</div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h1 className="admin-card-title">Blog Posts</h1>
            <p className="admin-card-subtitle">Create, edit, and manage blog posts.</p>
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
                    <td><span className="post-category-tag">{post.category || 'Guides'}</span></td>
                    <td>{post.author || 'wm'}</td>
                    <td>{post.date}</td>
                    <td>
                      <div className="action-buttons">
                        <Link href={`/blog/${post.slug}`} target="_blank" className="action-btn action-btn-view">
                          View
                        </Link>
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
