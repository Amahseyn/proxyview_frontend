'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import RichTextEditor from '@/components/admin/RichTextEditor';
import AdminAlert from '@/components/admin/AdminAlert';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { POST_CATEGORIES } from '@/lib/admin/constants';
import { META_DESCRIPTION_MAX, META_TITLE_MAX } from '@/lib/postSeo';
import {
  extractExcerpt,
  formValuesToPostInput,
  getSubmitLabel,
  getSubmittingLabel,
  PostFormValues,
  PublishOption,
  slugify,
} from '@/lib/admin/postForm';
import { uploadImage } from '@/lib/api';

type PostFormProps = {
  mode: 'create' | 'edit';
  initialValues: PostFormValues;
  autoSlugFromTitle?: boolean;
  headerTitle: React.ReactNode;
  viewLiveSlug?: string;
  canViewLive?: boolean;
  onSubmit: (input: ReturnType<typeof formValuesToPostInput>) => Promise<{ success: boolean; message?: string }>;
  onSuccess?: () => void;
};

export default function PostForm({
  mode,
  initialValues,
  autoSlugFromTitle = mode === 'create',
  headerTitle,
  viewLiveSlug,
  canViewLive = false,
  onSubmit,
  onSuccess,
}: PostFormProps) {
  const [values, setValues] = useState<PostFormValues>(initialValues);
  const [customSlug, setCustomSlug] = useState(mode === 'edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const submitLabel = getSubmitLabel(values.publishOption, mode);
  const submittingLabel = getSubmittingLabel(values.publishOption);

  const updateField = <K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleTitleChange = (title: string) => {
    setValues(prev => ({
      ...prev,
      title,
      slug: autoSlugFromTitle && !customSlug ? slugify(title) : prev.slug,
    }));
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumb(true);
    setErrorMsg('');
    try {
      const res = await uploadImage(file);
      if (res.success && res.url) {
        updateField('thumbnail', res.url);
      } else {
        setErrorMsg(res.message || 'Failed to upload featured image.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setErrorMsg(`Error uploading image: ${message}`);
    } finally {
      setIsUploadingThumb(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.title.trim()) {
      setErrorMsg('Please provide a post title.');
      return;
    }

    if (values.publishOption === 'schedule' && !values.scheduledAt) {
      setErrorMsg('Please choose a date and time to schedule this post.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await onSubmit(formValuesToPostInput(values));
      if (res.success) {
        const successMessages = {
          draft: mode === 'create' ? 'Draft saved successfully! Redirecting...' : 'Draft updated successfully!',
          publish: mode === 'create' ? 'Post published successfully! Redirecting...' : 'Post updated successfully!',
          schedule: mode === 'create' ? 'Post scheduled successfully! Redirecting...' : 'Schedule updated successfully!',
        };
        setSuccessMsg(successMessages[values.publishOption]);
        onSuccess?.();
      } else {
        setErrorMsg(res.message || `Failed to ${mode === 'create' ? 'create' : 'update'} post`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setErrorMsg(`Error: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadLabel = mode === 'create' ? 'Click to Upload Featured Image' : 'Click to Change Featured Image';

  const setPublishOption = (option: PublishOption) => {
    setValues(prev => ({
      ...prev,
      publishOption: option,
      scheduledAt: option === 'schedule' ? prev.scheduledAt : '',
    }));
  };

  return (
    <div className="container">
      <AdminPageHeader
        title={headerTitle}
        actions={
          <>
            {canViewLive && viewLiveSlug && (
              <Link href={`/blog/${viewLiveSlug}`} target="_blank" className="btn btn-outline admin-btn-sm">
                View Live ↗
              </Link>
            )}
            {mode === 'create' && (
              <Link href="/admin" className="btn btn-outline admin-btn-sm">Cancel</Link>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn btn-primary admin-btn-sm"
            >
              {isSubmitting ? submittingLabel : submitLabel}
            </button>
          </>
        }
      />

      {errorMsg && <AdminAlert type="error" message={errorMsg} />}
      {successMsg && <AdminAlert type="success" message={successMsg} />}

      <form onSubmit={handleSubmit} className="post-form-grid">
        <div>
          <div className="form-box">
            <div className="form-field">
              <label htmlFor="post-title">Post Title *</label>
              <input
                id="post-title"
                type="text"
                className="form-input form-input-lg"
                placeholder="e.g. Best Residential Proxies for Web Scraping in 2025"
                value={values.title}
                onChange={e => handleTitleChange(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="post-slug">
                URL Slug{' '}
                <span className="form-label-muted">
                  ({values.slug ? `/blog/${values.slug}` : 'Auto-generated'})
                </span>
              </label>
              <input
                id="post-slug"
                type="text"
                className="form-input"
                placeholder="url-slug-example"
                value={values.slug}
                onChange={e => {
                  updateField('slug', e.target.value);
                  setCustomSlug(true);
                }}
              />
              <p className="form-help">Unique link path for this article.</p>
            </div>
          </div>

          <div className="form-box">
            <h3 className="form-box-title">Post Content</h3>
            <p className="form-box-desc">
              Write and format the article body—headings, lists, tables, links, and images. Use bold and styles inside table cells via the cell toolbar.
            </p>
            <RichTextEditor
              value={values.content}
              onChange={content => updateField('content', content)}
              placeholder="Write your blog post content here..."
              label="Article body"
            />
          </div>

          <div className="form-box">
            <div className="form-field-header">
              <label htmlFor="post-excerpt">Excerpt / Summary</label>
              <button
                type="button"
                className="form-link-btn"
                onClick={() => updateField('excerpt', extractExcerpt(values.content))}
              >
                Auto-extract from content
              </button>
            </div>
            <textarea
              id="post-excerpt"
              rows={3}
              className="form-textarea"
              placeholder="Short preview for cards and meta descriptions..."
              value={values.excerpt}
              onChange={e => updateField('excerpt', e.target.value)}
            />
          </div>

          <div className="form-box">
            <div className="form-field-header">
              <div>
                <h3 className="form-box-title">SEO / Google Meta</h3>
                <p className="form-box-desc">Controls the title and description shown in Google search results.</p>
              </div>
            </div>

            <div className="form-field">
              <div className="form-field-header">
                <label htmlFor="post-meta-title">Meta Title</label>
                <button
                  type="button"
                  className="form-link-btn"
                  onClick={() => updateField('metaTitle', values.title)}
                >
                  Use post title
                </button>
              </div>
              <input
                id="post-meta-title"
                type="text"
                className="form-input"
                placeholder="Custom Google search title (optional)"
                value={values.metaTitle}
                onChange={e => updateField('metaTitle', e.target.value)}
                maxLength={META_TITLE_MAX}
              />
              <p className={`form-help seo-char-count ${values.metaTitle.length > META_TITLE_MAX ? 'over-limit' : ''}`}>
                {values.metaTitle.length}/{META_TITLE_MAX} characters · Recommended 50–60
              </p>
            </div>

            <div className="form-field">
              <div className="form-field-header">
                <label htmlFor="post-meta-description">Meta Description</label>
                <button
                  type="button"
                  className="form-link-btn"
                  onClick={() => updateField('metaDescription', values.excerpt || extractExcerpt(values.content))}
                >
                  Use excerpt
                </button>
              </div>
              <textarea
                id="post-meta-description"
                rows={3}
                className="form-textarea"
                placeholder="Custom Google search description (optional)"
                value={values.metaDescription}
                onChange={e => updateField('metaDescription', e.target.value)}
                maxLength={META_DESCRIPTION_MAX}
              />
              <p className={`form-help seo-char-count ${values.metaDescription.length > META_DESCRIPTION_MAX ? 'over-limit' : ''}`}>
                {values.metaDescription.length}/{META_DESCRIPTION_MAX} characters · Recommended 150–160
              </p>
            </div>

            <div className="seo-preview">
              <p className="seo-preview-label">Google preview</p>
              <div className="seo-preview-card">
                <p className="seo-preview-title">
                  {values.metaTitle || values.title || 'Post title'}
                </p>
                <p className="seo-preview-url">
                  proxyview.net/blog/{values.slug || 'your-post-slug'}
                </p>
                <p className="seo-preview-description">
                  {values.metaDescription || values.excerpt || 'Your meta description will appear here.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="form-box">
            <h3 className="form-box-title">Publish</h3>
            <p className="form-box-desc">Save as draft, publish immediately, or schedule for later.</p>

            <div className="publish-options">
              <label className={`publish-option ${values.publishOption === 'draft' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="publish-option"
                  checked={values.publishOption === 'draft'}
                  onChange={() => setPublishOption('draft')}
                />
                <span className="publish-option-title">Draft</span>
                <span className="publish-option-desc">Hidden from the public blog until published.</span>
              </label>

              <label className={`publish-option ${values.publishOption === 'publish' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="publish-option"
                  checked={values.publishOption === 'publish'}
                  onChange={() => setPublishOption('publish')}
                />
                <span className="publish-option-title">Publish now</span>
                <span className="publish-option-desc">Make this post visible on the blog immediately.</span>
              </label>

              <label className={`publish-option ${values.publishOption === 'schedule' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="publish-option"
                  checked={values.publishOption === 'schedule'}
                  onChange={() => setPublishOption('schedule')}
                />
                <span className="publish-option-title">Schedule</span>
                <span className="publish-option-desc">Choose a future date and time to publish automatically.</span>
              </label>
            </div>

            {values.publishOption === 'schedule' && (
              <div className="form-field form-field-spaced">
                <label htmlFor="post-scheduled-at">Publish date & time *</label>
                <input
                  id="post-scheduled-at"
                  type="datetime-local"
                  className="form-input"
                  value={values.scheduledAt}
                  onChange={e => updateField('scheduledAt', e.target.value)}
                  required
                />
                <p className="form-help">The post will appear on the blog at this time.</p>
              </div>
            )}
          </div>

          <div className="form-box">
            <h3 className="form-box-title">Featured Image</h3>

            {values.thumbnail && (
              <div className="image-preview-wrapper">
                <Image
                  src={values.thumbnail}
                  alt="Featured preview"
                  width={380}
                  height={220}
                  unoptimized
                  className="image-preview"
                />
                <button
                  type="button"
                  className="image-remove-btn"
                  onClick={() => updateField('thumbnail', '')}
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="form-field">
              <label className="image-uploader-box">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="sr-only"
                  disabled={isUploadingThumb}
                />
                <div className="image-uploader-icon">🖼️</div>
                <div className="image-uploader-title">
                  {isUploadingThumb ? 'Uploading image...' : uploadLabel}
                </div>
                <div className="image-uploader-hint">PNG, JPG, WebP up to 10MB</div>
              </label>
            </div>

            <div className="form-field">
              <label htmlFor="thumb-url">Or paste image URL</label>
              <input
                id="thumb-url"
                type="text"
                className="form-input"
                placeholder="https://... or /images/..."
                value={values.thumbnail}
                onChange={e => updateField('thumbnail', e.target.value)}
              />
            </div>
          </div>

          <div className="form-box">
            <h3 className="form-box-title">Post Settings</h3>

            <div className="form-field">
              <label htmlFor="post-category">Category</label>
              <select
                id="post-category"
                className="form-select-full"
                value={values.category}
                onChange={e => updateField('category', e.target.value)}
              >
                {POST_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="Other">Custom category...</option>
              </select>

              {values.category === 'Other' && (
                <input
                  type="text"
                  className="form-input form-input-spaced"
                  placeholder="Enter custom category..."
                  value={values.customCategory}
                  onChange={e => updateField('customCategory', e.target.value)}
                />
              )}
            </div>

            <div className="form-field">
              <label htmlFor="post-author">Author</label>
              <input
                id="post-author"
                type="text"
                className="form-input"
                value={values.author}
                onChange={e => updateField('author', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="post-date">Display Date</label>
              <input
                id="post-date"
                type="text"
                className="form-input"
                value={values.date}
                onChange={e => updateField('date', e.target.value)}
              />
              <p className="form-help">Shown on the blog card and article page.</p>
            </div>
          </div>

          <div className="form-box form-box-muted">
            <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-block">
              {isSubmitting ? submittingLabel : submitLabel}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
