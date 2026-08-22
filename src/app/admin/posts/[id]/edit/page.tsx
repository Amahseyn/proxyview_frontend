'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { getPost, updatePost, uploadImage, Post } from '@/lib/api';

type Props = {
  params: Promise<{ id: string }>;
};

export default function EditPostPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Guides');
  const [customCategory, setCustomCategory] = useState('');
  const [author, setAuthor] = useState('');
  const [date, setDate] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Load post details
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getPost(id);
        if (data) {
          setPost(data);
          setTitle(data.title || '');
          setSlug(data.slug || '');
          setCategory(
            ['Guides', 'Comparisons', 'Research', 'Reviews', 'News'].includes(data.category)
              ? data.category
              : 'Other'
          );
          if (!['Guides', 'Comparisons', 'Research', 'Reviews', 'News'].includes(data.category)) {
            setCustomCategory(data.category || '');
          }
          setAuthor(data.author || 'wm');
          setDate(data.date || '');
          setThumbnail(data.thumbnail || '');
          setExcerpt(data.excerpt || '');
          setContent(data.content || '');
        } else {
          setErrorMsg('Post not found');
        }
      } catch (err: any) {
        setErrorMsg('Error loading post: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Thumbnail File Upload
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingThumb(true);
      setErrorMsg('');
      const res = await uploadImage(file);
      if (res.success && res.url) {
        setThumbnail(res.url);
      } else {
        setErrorMsg(res.message || 'Failed to upload image.');
      }
    } catch (err: any) {
      setErrorMsg('Error uploading image: ' + err.message);
    } finally {
      setIsUploadingThumb(false);
    }
  };

  // Auto generate excerpt from content
  const handleAutoExtractExcerpt = () => {
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    if (plainText) {
      setExcerpt(plainText.slice(0, 150) + (plainText.length > 150 ? '...' : ''));
    }
  };

  // Submit Update Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please provide a post title.');
      return;
    }

    const finalCategory = category === 'Other' ? (customCategory.trim() || 'Guides') : category;

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await updatePost(id, {
        title: title.trim(),
        slug: slug.trim() || undefined,
        category: finalCategory,
        author: author.trim() || 'wm',
        date: date.trim() || undefined,
        thumbnail: thumbnail || '',
        excerpt: excerpt.trim() || undefined,
        content: content || '',
      });

      if (res.success && res.data) {
        setSuccessMsg('Post updated successfully!');
        setPost(res.data);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.message || 'Failed to update post');
      }
    } catch (err: any) {
      setErrorMsg('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <p style={{ fontSize: '18px', color: '#64748b' }}>Loading post details...</p>
      </div>
    );
  }

  if (!post && !loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: '12px' }}>Post Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>The post you requested could not be found.</p>
        <Link href="/admin" className="btn btn-primary">
          ← Return to Admin Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <Link href="/admin" style={{ fontSize: '14px', color: '#64748b', textDecoration: 'none', display: 'inline-block', marginBottom: '6px' }}>
            ← Back to Posts
          </Link>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', color: 'var(--primary)' }}>
            Edit Post: <span style={{ fontWeight: 400 }}>{title}</span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {slug && (
            <Link
              href={`/blog/${slug}`}
              target="_blank"
              className="btn btn-outline"
              style={{ padding: '10px 18px', fontSize: '14px' }}
            >
              👁️ View Live ↗
            </Link>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ padding: '10px 24px', fontSize: '14px' }}
          >
            {isSubmitting ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div style={{ padding: '14px 20px', marginBottom: '20px', borderRadius: '8px', background: '#fce8e6', color: '#c5221f', border: '1px solid #fad2cf' }}>
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: '14px 20px', marginBottom: '20px', borderRadius: '8px', background: '#e6f4ea', color: '#137333', border: '1px solid #ceead6' }}>
          {successMsg}
        </div>
      )}

      {/* Edit Form Grid */}
      <form onSubmit={handleSubmit} className="post-form-grid">
        {/* Left Column: Title & Rich Text Content */}
        <div>
          <div className="form-box">
            <div className="form-field">
              <label htmlFor="edit-title">Post Title *</label>
              <input
                id="edit-title"
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ fontSize: '18px', fontWeight: 600 }}
              />
            </div>

            <div className="form-field">
              <label htmlFor="edit-slug">
                URL Slug <span style={{ fontWeight: 'normal', color: '#64748b' }}>({slug ? `/blog/${slug}` : 'Auto-generated'})</span>
              </label>
              <input
                id="edit-slug"
                type="text"
                className="form-input"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <p className="form-help">Custom URL slug path for this article.</p>
            </div>
          </div>

          {/* Rich Content Editor */}
          <div className="form-box">
            <h3 className="form-box-title">Post Content &amp; Typography</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Format typography with font sizes, bold, headings, colors, lists, quotes, and insert images.
            </p>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write your blog post content here... Highlight text to change font size, bold, heading level, or colors."
            />
          </div>

          {/* Excerpt */}
          <div className="form-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label htmlFor="edit-excerpt" style={{ fontWeight: 600, color: '#334155', fontSize: '14px' }}>
                Excerpt / Summary
              </label>
              <button
                type="button"
                onClick={handleAutoExtractExcerpt}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
              >
                ⚡ Auto-extract from Content
              </button>
            </div>
            <textarea
              id="edit-excerpt"
              rows={3}
              className="form-textarea"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </div>
        </div>

        {/* Right Column: Settings & Featured Image */}
        <div>
          {/* Featured Image */}
          <div className="form-box">
            <h3 className="form-box-title">Featured Image</h3>

            {thumbnail ? (
              <div className="image-preview-wrapper" style={{ marginBottom: '16px' }}>
                <Image
                  src={thumbnail}
                  alt="Featured preview"
                  width={380}
                  height={220}
                  unoptimized
                  style={{ objectFit: 'cover', width: '100%', maxHeight: '200px' }}
                />
                <button
                  type="button"
                  className="image-remove-btn"
                  onClick={() => setThumbnail('')}
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            ) : null}

            <div className="form-field">
              <label className="image-uploader-box">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  style={{ display: 'none' }}
                  disabled={isUploadingThumb}
                />
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🖼️</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)' }}>
                  {isUploadingThumb ? 'Uploading image...' : 'Click to Change Featured Image'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  PNG, JPG, WebP up to 10MB
                </div>
              </label>
            </div>

            <div className="form-field">
              <label htmlFor="edit-thumb-url" style={{ fontSize: '13px' }}>Or Paste Image URL</label>
              <input
                id="edit-thumb-url"
                type="text"
                className="form-input"
                placeholder="https://... or /images/..."
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
              />
            </div>
          </div>

          {/* Post Metadata */}
          <div className="form-box">
            <h3 className="form-box-title">Post Settings</h3>

            <div className="form-field">
              <label htmlFor="edit-category">Category</label>
              <select
                id="edit-category"
                className="form-select-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Guides">Guides</option>
                <option value="Comparisons">Comparisons</option>
                <option value="Research">Research</option>
                <option value="Reviews">Reviews</option>
                <option value="News">News</option>
                <option value="Other">Custom Category...</option>
              </select>

              {category === 'Other' && (
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter custom category..."
                  style={{ marginTop: '8px' }}
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              )}
            </div>

            <div className="form-field">
              <label htmlFor="edit-author">Author</label>
              <input
                id="edit-author"
                type="text"
                className="form-input"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="edit-date">Published Date</label>
              <input
                id="edit-date"
                type="text"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Save Changes CTA */}
          <div className="form-box" style={{ background: '#f8fafc' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}
            >
              {isSubmitting ? 'Saving Changes...' : '💾 Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
