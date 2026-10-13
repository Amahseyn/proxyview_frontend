'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminAlert from '@/components/admin/AdminAlert';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { formatScheduledAt, getPostStatusLabel, isPostPublic } from '@/lib/postStatus';
import {
  deletePost,
  duplicatePost,
  getContactMessages,
  getCategories,
  getTags,
  queryPosts,
  updatePost,
  Post,
  Tag,
} from '@/lib/api';

const PAGE_SIZE = 10;

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
  const [total, setTotal] = useState(0);
  const [tags, setTags] = useState<Tag[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>(['All']);
  const [messageCount, setMessageCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedTagId, setSelectedTagId] = useState('All');
  const [sortBy, setSortBy] = useState<'id' | 'title' | 'date' | 'updatedAt' | 'status'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const [result, messagesData, tagList, categoryList] = await Promise.all([
        queryPosts({
          admin: true,
          search: searchQuery.trim() || undefined,
          category: selectedCategory,
          status: selectedStatus,
          tagId: selectedTagId !== 'All' ? Number(selectedTagId) : undefined,
          sortBy,
          sortOrder,
          page,
          limit: PAGE_SIZE,
        }),
        getContactMessages(),
        getTags(),
        getCategories(),
      ]);
      setPosts(result.data);
      setTotal(result.total);
      setMessageCount(messagesData.length);
      setTags(tagList);
      setCategoryOptions(['All', ...categoryList.map(c => c.name)]);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, selectedCategory, selectedStatus, selectedTagId, sortBy, sortOrder]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deletePost(postToDelete.id);
      if (res.success) {
        setNotification({ type: 'success', message: `Post "${postToDelete.title}" was deleted.` });
        setPostToDelete(null);
        await loadPosts();
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

  const togglePublish = async (post: Post) => {
    const nextStatus = isPostPublic(post) || post.status === 'published' ? 'draft' : 'published';
    const res = await updatePost(post.id, { status: nextStatus });
    if (res.success) {
      setNotification({
        type: 'success',
        message: nextStatus === 'published' ? 'Post published.' : 'Post moved to draft.',
      });
      await loadPosts();
    }
  };

  const handleDuplicate = async (post: Post) => {
    const res = await duplicatePost(post.id);
    if (res.success) {
      setNotification({ type: 'success', message: 'Post duplicated as draft.' });
      await loadPosts();
    } else {
      setNotification({ type: 'error', message: res.message || 'Duplicate failed.' });
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
            <div className="stat-number">{total}</div>
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
            <p className="admin-card-subtitle">Search, filter, sort, and manage posts.</p>
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
              onChange={e => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="admin-search-input"
            />
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="admin-select"
            >
              {categoryOptions.map(cat => (
                <option key={cat} value={cat}>Category: {cat}</option>
              ))}
            </select>
            <select
              value={selectedTagId}
              onChange={e => {
                setSelectedTagId(e.target.value);
                setPage(1);
              }}
              className="admin-select"
            >
              <option value="All">Tag: All</option>
              {tags.map(tag => (
                <option key={tag.id} value={tag.id}>Tag: {tag.name}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="admin-select"
            >
              <option value="All">Status: All</option>
              <option value="draft">Status: Draft</option>
              <option value="scheduled">Status: Scheduled</option>
              <option value="published">Status: Published</option>
              <option value="archived">Status: Archived</option>
            </select>
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={e => {
                const [field, order] = e.target.value.split(':') as [typeof sortBy, typeof sortOrder];
                setSortBy(field);
                setSortOrder(order);
              }}
              className="admin-select"
            >
              <option value="updatedAt:desc">Sort: Recently updated</option>
              <option value="title:asc">Sort: Title A–Z</option>
              <option value="title:desc">Sort: Title Z–A</option>
              <option value="date:desc">Sort: Display date</option>
              <option value="status:asc">Sort: Status</option>
            </select>
            <span className="admin-filter-count">
              Showing <strong>{posts.length}</strong> of {total}
            </span>
          </div>
        </div>

        <div className="admin-table-wrapper">
          {loading ? (
            <div className="admin-loading">Loading posts...</div>
          ) : posts.length === 0 ? (
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
                  <th>Tags</th>
                  <th>Author</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
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
                    <td>
                      <div className="post-tag-list">
                        {post.tags?.length
                          ? post.tags.map(t => <span key={t.id} className="post-category-tag">{t.name}</span>)
                          : '—'}
                      </div>
                    </td>
                    <td>{post.author || 'wm'}</td>
                    <td>{post.date}</td>
                    <td>
                      <div className="action-buttons">
                        <Link href={`/admin/posts/${post.id}/edit`} className="action-btn action-btn-edit">
                          Edit
                        </Link>
                        <Link href={`/admin/posts/${post.id}/preview`} className="action-btn action-btn-view">
                          Preview
                        </Link>
                        <button type="button" className="action-btn" onClick={() => handleDuplicate(post)}>
                          Duplicate
                        </button>
                        <button type="button" className="action-btn" onClick={() => togglePublish(post)}>
                          {isPostPublic(post) ? 'Unpublish' : 'Publish'}
                        </button>
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

        {pageCount > 1 && (
          <div className="admin-pagination">
            <button
              type="button"
              className="btn btn-outline admin-btn-sm"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="admin-filter-count">Page {page} of {pageCount}</span>
            <button
              type="button"
              className="btn btn-outline admin-btn-sm"
              disabled={page >= pageCount}
              onClick={() => setPage(p => Math.min(pageCount, p + 1))}
            >
              Next
            </button>
          </div>
        )}
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
