'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ContentBlockEditor, { type MediaInsertRequest } from '@/components/admin/ContentBlockEditor';
import PostMediaPanel from '@/components/admin/PostMediaPanel';
import PostFaqEditor from '@/components/admin/PostFaqEditor';
import PostTocEditor from '@/components/admin/PostTocEditor';
import CollapsibleFormSection from '@/components/admin/CollapsibleFormSection';
import PublishStatusPicker from '@/components/admin/PublishStatusPicker';
import TaxonomyChipPicker from '@/components/admin/TaxonomyChipPicker';
import AdminAlert from '@/components/admin/AdminAlert';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { META_DESCRIPTION_MAX, META_TITLE_MAX } from '@/lib/postSeo';
import { getEditorPlainStats } from '@/lib/editorStats';
import {
  extractExcerpt,
  formValuesToPostInput,
  getSubmitLabel,
  getSubmittingLabel,
  PostFormValues,
  PublishOption,
  slugify,
} from '@/lib/admin/postForm';
import { getCategories, getTags, uploadImage, type Category, type Tag } from '@/lib/api';

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
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [mediaInsert, setMediaInsert] = useState<MediaInsertRequest | null>(null);
  const [imageUploadBatch, setImageUploadBatch] = useState<{ seq: number; files: File[] } | null>(null);
  const [isUploadingContentImages, setIsUploadingContentImages] = useState(false);
  const [scrollToBlockId, setScrollToBlockId] = useState<string | null>(null);

  const contentStats = useMemo(() => getEditorPlainStats(values.content), [values.content]);

  useEffect(() => {
    async function loadTaxonomy() {
      try {
        const [categories, tags] = await Promise.all([getCategories(), getTags()]);
        setAllCategories(categories);
        setAllTags(tags);
      } catch (err) {
        console.error('Failed to load categories/tags:', err);
      }
    }
    loadTaxonomy();
  }, []);

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

  const uploadFeaturedImage = async (file: File) => {
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

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFeaturedImage(file);
    e.target.value = '';
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
      const res = await onSubmit(formValuesToPostInput(values, { categories: allCategories }));
      if (res.success) {
        const successMessages = {
          draft: mode === 'create' ? 'Draft saved successfully! Redirecting...' : 'Draft updated successfully!',
          publish: mode === 'create' ? 'Post published successfully! Redirecting...' : 'Post updated successfully!',
          schedule: mode === 'create' ? 'Post scheduled successfully! Redirecting...' : 'Schedule updated successfully!',
          archive: 'Post archived successfully!',
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

  const setPublishOption = (option: PublishOption) => {
    setValues(prev => ({
      ...prev,
      publishOption: option,
      scheduledAt: option === 'schedule' ? prev.scheduledAt : '',
    }));
  };

  return (
    <div className="container post-form-page">
      <div className="post-form-topbar">
        <AdminPageHeader
          title={headerTitle}
          actions={
            <>
              <span className="post-form-meta-pill">{contentStats.words} words · ~{contentStats.readingMinutes} min</span>
              {canViewLive && viewLiveSlug && (
                <Link href={`/blog/${viewLiveSlug}`} target="_blank" className="btn btn-outline admin-btn-sm">
                  Preview live ↗
                </Link>
              )}
              {mode === 'create' && (
                <Link href="/admin" className="btn btn-outline admin-btn-sm">Cancel</Link>
              )}
              <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="btn btn-primary admin-btn-sm">
                {isSubmitting ? submittingLabel : submitLabel}
              </button>
            </>
          }
        />
      </div>

      {errorMsg && <AdminAlert type="error" message={errorMsg} />}
      {successMsg && <AdminAlert type="success" message={successMsg} />}

      <form onSubmit={handleSubmit} className="post-form-layout">
        <div className="post-form-main">
          <div className="post-title-wrap">
            <label className="sr-only" htmlFor="post-title">Post title</label>
            <input
              id="post-title"
              type="text"
              className="post-title-input"
              placeholder="Give your post a clear, compelling title…"
              value={values.title}
              onChange={e => handleTitleChange(e.target.value)}
              required
            />
          </div>

          <PostMediaPanel
            blocksJson={values.blocksJson}
            featuredUrl={values.thumbnail}
            isUploadingFeatured={isUploadingThumb}
            onFeaturedChange={url => updateField('thumbnail', url)}
            onFeaturedUpload={uploadFeaturedImage}
            onUploadImagesToContent={files => {
              setIsUploadingContentImages(true);
              setImageUploadBatch({ seq: Date.now(), files });
            }}
            isUploadingContentImages={isUploadingContentImages}
            onAddImageBlock={() => setMediaInsert({ seq: Date.now(), type: 'image' })}
            onAddVideoBlock={() => setMediaInsert({ seq: Date.now(), type: 'video' })}
            onJumpToBlock={id => setScrollToBlockId(id)}
          />

          <div className="post-editor-surface">
            <ContentBlockEditor
              key={`${mode}-${initialValues.slug}`}
              blocksJson={values.blocksJson}
              contentHtml={values.content}
              onChange={({ blocksJson, contentHtml }) =>
                setValues(prev => ({ ...prev, blocksJson, content: contentHtml }))
              }
              mediaInsert={mediaInsert}
              onMediaInsertDone={() => setMediaInsert(null)}
              imageUploadBatch={imageUploadBatch}
              onImageUploadBatchDone={() => {
                setImageUploadBatch(null);
                setIsUploadingContentImages(false);
              }}
              scrollToBlockId={scrollToBlockId}
              onScrollToBlockDone={() => setScrollToBlockId(null)}
            />
          </div>

          <CollapsibleFormSection title="Excerpt" icon="✎" hint={values.excerpt ? `${values.excerpt.slice(0, 40)}…` : 'Optional'}>
            <button
              type="button"
              className="form-link-btn"
              onClick={() => updateField('excerpt', extractExcerpt(values.content))}
            >
              Auto-extract from content
            </button>
            <textarea
              id="post-excerpt"
              rows={3}
              className="form-textarea"
              placeholder="Short preview for cards and search…"
              value={values.excerpt}
              onChange={e => updateField('excerpt', e.target.value)}
            />
          </CollapsibleFormSection>

          <CollapsibleFormSection title="SEO & search" icon="🔍" hint="Google & social">
            <div className="seo-preview seo-preview--inline">
              <p className="seo-preview-label">Search preview</p>
              <div className="seo-preview-card">
                <p className="seo-preview-title">{values.metaTitle || values.title || 'Post title'}</p>
                <p className="seo-preview-url">
                  {values.canonicalUrl || `proxyview.net/blog/${values.slug || 'your-slug'}`}
                </p>
                <p className="seo-preview-description">
                  {values.metaDescription || values.excerpt || 'Meta description appears here.'}
                </p>
              </div>
            </div>
            <div className="form-field">
              <div className="form-field-header">
                <label htmlFor="post-meta-title">Meta title</label>
                <button type="button" className="form-link-btn" onClick={() => updateField('metaTitle', values.title)}>
                  Use title
                </button>
              </div>
              <input
                id="post-meta-title"
                type="text"
                className="form-input"
                value={values.metaTitle}
                onChange={e => updateField('metaTitle', e.target.value)}
                maxLength={META_TITLE_MAX}
              />
              <p className={`form-help seo-char-count ${values.metaTitle.length > META_TITLE_MAX ? 'over-limit' : ''}`}>
                {values.metaTitle.length}/{META_TITLE_MAX}
              </p>
            </div>
            <div className="form-field">
              <div className="form-field-header">
                <label htmlFor="post-meta-description">Meta description</label>
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
                value={values.metaDescription}
                onChange={e => updateField('metaDescription', e.target.value)}
                maxLength={META_DESCRIPTION_MAX}
              />
              <p className={`form-help seo-char-count ${values.metaDescription.length > META_DESCRIPTION_MAX ? 'over-limit' : ''}`}>
                {values.metaDescription.length}/{META_DESCRIPTION_MAX}
              </p>
            </div>
            <div className="form-field">
              <label htmlFor="post-canonical-url">Canonical URL</label>
              <input
                id="post-canonical-url"
                type="text"
                className="form-input"
                placeholder="/blog/slug"
                value={values.canonicalUrl}
                onChange={e => updateField('canonicalUrl', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="post-og-image">Open Graph image</label>
              <input
                id="post-og-image"
                type="text"
                className="form-input"
                placeholder="Defaults to featured image"
                value={values.ogImage}
                onChange={e => updateField('ogImage', e.target.value)}
              />
            </div>
            <label className="form-checkbox-row">
              <input type="checkbox" checked={values.seoNoIndex} onChange={e => updateField('seoNoIndex', e.target.checked)} />
              <span>NoIndex — hide from search engines</span>
            </label>
          </CollapsibleFormSection>
        </div>

        <aside className="post-form-sidebar">
          <div className="sidebar-card sidebar-card--publish">
            <h3 className="sidebar-card-title">Publish</h3>
            <PublishStatusPicker value={values.publishOption} onChange={setPublishOption} />
            {values.publishOption === 'schedule' && (
              <div className="form-field form-field-spaced">
                <label htmlFor="post-scheduled-at">Publish at</label>
                <input
                  id="post-scheduled-at"
                  type="datetime-local"
                  className="form-input"
                  value={values.scheduledAt}
                  onChange={e => updateField('scheduledAt', e.target.value)}
                  required
                />
              </div>
            )}
            <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-block post-sidebar-save">
              {isSubmitting ? submittingLabel : submitLabel}
            </button>
          </div>

          <CollapsibleFormSection variant="sidebar" title="URL" icon="🔗" defaultOpen hint={values.slug || 'auto'}>
            <input
              id="post-slug"
              type="text"
              className="form-input"
              placeholder="url-slug"
              value={values.slug}
              onChange={e => {
                updateField('slug', e.target.value);
                setCustomSlug(true);
              }}
            />
            <p className="form-help post-slug-preview">proxyview.net/blog/{values.slug || '…'}</p>
          </CollapsibleFormSection>

          <CollapsibleFormSection
            variant="sidebar"
            title="Featured image"
            icon="🖼"
            defaultOpen={Boolean(values.thumbnail)}
            hint={values.thumbnail ? 'Set' : 'None'}
          >
            {values.thumbnail && (
              <div className="image-preview-wrapper image-preview-wrapper--compact">
                <Image src={values.thumbnail} alt="" width={320} height={180} unoptimized className="image-preview" />
                <button type="button" className="image-remove-btn" onClick={() => updateField('thumbnail', '')}>✕</button>
              </div>
            )}
            <label className="image-uploader-box image-uploader-box--compact">
              <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="sr-only" disabled={isUploadingThumb} />
              <span>{isUploadingThumb ? 'Uploading…' : 'Upload image'}</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Or paste URL"
              value={values.thumbnail}
              onChange={e => updateField('thumbnail', e.target.value)}
            />
          </CollapsibleFormSection>

          <CollapsibleFormSection variant="sidebar" title="Categories & tags" icon="🏷" defaultOpen>
            <TaxonomyChipPicker
              label="Categories"
              options={allCategories}
              selectedIds={values.categoryIds}
              onChange={ids => updateField('categoryIds', ids)}
              emptyHint="Create categories in admin → Categories"
            />
            <p className="form-help">The first selected category is the label on blog cards.</p>
            <TaxonomyChipPicker
              label="Tags"
              options={allTags}
              selectedIds={values.tagIds}
              onChange={ids => updateField('tagIds', ids)}
              emptyHint="Create tags in admin → Tags"
            />
          </CollapsibleFormSection>

          <CollapsibleFormSection
            variant="sidebar"
            title="Table of contents"
            icon="☰"
            defaultOpen
            hint="In-page navigation"
          >
            <PostTocEditor
              tocJson={values.tocJson}
              contentHtml={values.content}
              onChange={tocJson => updateField('tocJson', tocJson)}
            />
          </CollapsibleFormSection>

          <CollapsibleFormSection variant="sidebar" title="Details" icon="⚙" hint={values.author}>
            <div className="form-field">
              <label htmlFor="post-author">Author</label>
              <input id="post-author" type="text" className="form-input" value={values.author} onChange={e => updateField('author', e.target.value)} />
            </div>
            <div className="form-field">
              <label htmlFor="post-date">Display date</label>
              <input id="post-date" type="text" className="form-input" value={values.date} onChange={e => updateField('date', e.target.value)} />
            </div>
          </CollapsibleFormSection>
        </aside>

        <div className="post-form-faq">
          <CollapsibleFormSection title="Post FAQ" icon="?" hint="Optional Q&A for this article">
            <PostFaqEditor faqJson={values.faqJson} onChange={faqJson => updateField('faqJson', faqJson)} />
          </CollapsibleFormSection>
        </div>
      </form>
    </div>
  );
}