'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPosts, deletePost, Post } from '@/lib/api';

export default function AdminDashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load posts
  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await getPosts();
      setPosts(data);
      setFilteredPosts(data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Filter posts based on search query and category
  useEffect(() => {
    let result = [...posts];

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    setFilteredPosts(result);
  }, [searchQuery, selectedCategory, posts]);

  // Handle post deletion
  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deletePost(postToDelete.id);
      if (res.success) {
        setNotification({ type: 'success', message: `Post "${postToDelete.title}" was successfully deleted.` });
        setPosts(prev => prev.filter(p => p.id !== postToDelete.id));
        setPostToDelete(null);
      } else {
        setNotification({ type: 'error', message: res.message || 'Failed to delete post.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error deleting post.' });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Get unique categories for filter
  const categories = ['All', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];

  return (
    <div className="container">
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            padding: '14px 20px',
            marginBottom: '20px',
            borderRadius: '8px',
            background: notification.type === 'success' ? '#e6f4ea' : '#fce8e6',
            color: notification.type === 'success' ? '#137333' : '#c5221f',
            border: `1px solid ${notification.type === 'success' ? '#ceead6' : '#fad2cf'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'var(--font-ui)',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Quick Stats Grid */}
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
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <h4>Published</h4>
            <div className="stat-number">{posts.length}</div>
          </div>
        </div>
      </div>

      {/* Main Management Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h1 className="admin-card-title">Blog Posts Management</h1>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', fontFamily: 'var(--font-ui)' }}>
              Create, edit, style typography, upload featured images, and delete posts.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/admin/posts/new" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
              + Add New Post
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ padding: '16px 28px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div className="admin-filter-bar">
            <input
              type="text"
              placeholder="🔍 Search posts by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="admin-select"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>

            <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b', fontFamily: 'var(--font-ui)' }}>
              Showing <strong>{filteredPosts.length}</strong> of {posts.length} posts
            </span>
          </div>
        </div>

        {/* Posts Table */}
        <div className="admin-table-wrapper">
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              Loading posts...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <p style={{ fontSize: '18px', color: '#334155', fontWeight: 600, marginBottom: '8px' }}>
                No posts found
              </p>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
                Try adjusting your search criteria or create a new blog post.
              </p>
              <Link href="/admin/posts/new" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                + Create First Post
              </Link>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Image</th>
                  <th>Title &amp; Slug</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Published Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
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
                          <span style={{ fontSize: '18px' }}>📄</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="post-title-cell">
                        <Link href={`/admin/posts/${post.id}/edit`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                          {post.title}
                        </Link>
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', fontFamily: 'monospace' }}>
                        /{post.slug}
                      </div>
                    </td>
                    <td>
                      <span className="post-category-tag">{post.category || 'Guides'}</span>
                    </td>
                    <td>{post.author || 'wm'}</td>
                    <td>{post.date}</td>
                    <td>
                      <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="action-btn action-btn-view"
                          title="View live post"
                        >
                          👁️ View
                        </Link>
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="action-btn action-btn-edit"
                          title="Edit post content & typography"
                        >
                          ✏️ Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setPostToDelete(post)}
                          className="action-btn action-btn-delete"
                          title="Delete post"
                        >
                          🗑️ Delete
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

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-title">Delete Post?</h3>
            <p className="modal-desc">
              Are you sure you want to permanently delete <strong>&quot;{postToDelete.title}&quot;</strong>? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '8px 16px', fontSize: '14px' }}
                onClick={() => setPostToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ background: '#dc2626', color: '#fff', padding: '8px 18px', fontSize: '14px' }}
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
