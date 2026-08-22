'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { createPost, uploadImage } from '@/lib/api';

export default function NewPostPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [customSlug, setCustomSlug] = useState(false);
  const [category, setCategory] = useState('Guides');
  const [customCategory, setCustomCategory] = useState('');
  const [author, setAuthor] = useState('wm');
  const [date, setDate] = useState(
    new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  );
  const [thumbnail, setThumbnail] = useState('/images/Untitled-470-x-300-px-300x191.png');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!customSlug) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generated);
    }
  };

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
        setErrorMsg(res.message || 'Failed to upload featured image.');
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

  // Submit Post Form
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
      const res = await createPost({
        title: title.trim(),
        slug: slug.trim() || undefined,
        category: finalCategory,
        author: author.trim() || 'wm',
        date: date.trim() || undefined,
        thumbnail: thumbnail || '/images/Untitled-470-x-300-px-300x191.png',
        excerpt: excerpt.trim() || undefined,
        content: content || '',
      });

      if (res.success && res.data) {
        setSuccessMsg('Post created successfully! Redirecting...');
        setTimeout(() => {
          router.push('/admin');
        }, 1200);
      } else {
        setErrorMsg(res.message || 'Failed to create post');
      }
    } catch (err: any) {
      setErrorMsg('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <Link href="/admin" style={{ fontSize: '14px', color: '#64748b', textDecoration: 'none', display: 'inline-block', marginBottom: '6px' }}>
            ← Back to Posts
          </Link>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', color: 'var(--primary)' }}>
            Create New Blog Post
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/admin" className="btn btn-outline" style={{ padding: '10px 20px', fontSize: '14px' }}>
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ padding: '10px 24px', fontSize: '14px' }}
          >
            {isSubmitting ? 'Publishing...' : '🚀 Publish Post'}
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

      {/* Form Grid */}
      <form onSubmit={handleSubmit} className="post-form-grid">
        {/* Left Column: Title & Rich Text Content */}
        <div>
          <div className="form-box">
            <div className="form-field">
              <label htmlFor="post-title">Post Title *</label>
              <input
                id="post-title"
                type="text"
                className="form-input"
                placeholder="e.g. Best Residential Proxies for Web Scraping in 2025"
                value={title}
                onChange={handleTitleChange}
                required
                style={{ fontSize: '18px', fontWeight: 600 }}
              />
            </div>

            <div className="form-field">
              <label htmlFor="post-slug">
                URL Slug <span style={{ fontWeight: 'normal', color: '#64748b' }}>({slug ? `/blog/${slug}` : 'Auto-generated'})</span>
              </label>
              <input
                id="post-slug"
                type="text"
                className="form-input"
                placeholder="url-slug-example"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setCustomSlug(true);
                }}
              />
              <p className="form-help">Unique link path for this article.</p>
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
              <label htmlFor="post-excerpt" style={{ fontWeight: 600, color: '#334155', fontSize: '14px' }}>
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
              id="post-excerpt"
              rows={3}
              className="form-textarea"
              placeholder="Short 1-2 sentence preview for cards and meta descriptions..."
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
                  {isUploadingThumb ? 'Uploading image...' : 'Click to Upload Featured Image'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  PNG, JPG, WebP up to 10MB
                </div>
              </label>
            </div>

            <div className="form-field">
              <label htmlFor="thumb-url" style={{ fontSize: '13px' }}>Or Paste Image URL</label>
              <input
                id="thumb-url"
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
              <label htmlFor="post-category">Category</label>
              <select
                id="post-category"
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
              <label htmlFor="post-author">Author</label>
              <input
                id="post-author"
                type="text"
                className="form-input"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="post-date">Published Date</label>
              <input
                id="post-date"
                type="text"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Publishing Box */}
          <div className="form-box" style={{ background: '#f8fafc' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}
            >
              {isSubmitting ? 'Publishing...' : '🚀 Publish Blog Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
