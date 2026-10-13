'use client';

import Image from 'next/image';
import { collectPostMedia, isVideoEmbedUrl, videoPreviewPoster } from '@/lib/contentBlocks/postMedia';

type PostMediaPanelProps = {
  blocksJson: string;
  featuredUrl: string;
  isUploadingFeatured?: boolean;
  onFeaturedChange: (url: string) => void;
  onFeaturedUpload: (file: File) => void;
  onAddImageBlock: () => void;
  onAddVideoBlock: () => void;
  onUploadImagesToContent?: (files: File[]) => void;
  isUploadingContentImages?: boolean;
  onJumpToBlock?: (blockId: string) => void;
};

export default function PostMediaPanel({
  blocksJson,
  featuredUrl,
  isUploadingFeatured,
  onFeaturedChange,
  onFeaturedUpload,
  onAddImageBlock,
  onAddVideoBlock,
  onUploadImagesToContent,
  isUploadingContentImages,
  onJumpToBlock,
}: PostMediaPanelProps) {
  const media = collectPostMedia(blocksJson, featuredUrl);
  const inContent = media.filter(m => m.kind !== 'featured');
  const featured = featuredUrl.trim();

  const handleFeaturedFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFeaturedUpload(file);
    e.target.value = '';
  };

  return (
    <section className="post-media-panel" aria-label="Post media">
      <div className="post-media-panel-head">
        <h2 className="post-media-panel-title">Images & video</h2>
        <p className="post-media-panel-sub">
          Featured image for cards and blog header. Upload multiple images into the article body (between paragraphs and other blocks), or add image/video blocks in the editor below.
        </p>
      </div>

      <div className="post-media-featured">
        <span className="post-media-featured-label">Featured image</span>
        {featured ? (
          <div className="post-media-featured-preview">
            <Image
              src={featured}
              alt="Current featured image"
              width={960}
              height={540}
              unoptimized
              className="post-media-featured-img"
            />
            <div className="post-media-featured-actions">
              <label className="btn btn-outline btn-sm post-media-file-btn">
                <input type="file" accept="image/*" className="sr-only" disabled={isUploadingFeatured} onChange={handleFeaturedFile} />
                {isUploadingFeatured ? 'Uploading…' : 'Replace'}
              </label>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => onFeaturedChange('')}>
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label className="post-media-featured-empty">
            <input type="file" accept="image/*" className="sr-only" disabled={isUploadingFeatured} onChange={handleFeaturedFile} />
            <span className="post-media-featured-empty-icon" aria-hidden>🖼</span>
            <span>{isUploadingFeatured ? 'Uploading featured image…' : 'Upload featured image'}</span>
          </label>
        )}
        <input
          type="text"
          className="form-input form-input-sm post-media-url-input"
          placeholder="Or paste featured image URL"
          value={featuredUrl}
          onChange={e => onFeaturedChange(e.target.value)}
        />
      </div>

      <div className="post-media-toolbar">
        {onUploadImagesToContent ? (
          <label className="btn btn-outline btn-sm post-media-file-btn">
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={isUploadingContentImages}
              onChange={e => {
                const picked = e.target.files ? Array.from(e.target.files) : [];
                if (picked.length) onUploadImagesToContent(picked);
                e.target.value = '';
              }}
            />
            {isUploadingContentImages ? 'Uploading…' : 'Upload images to content'}
          </label>
        ) : null}
        <button type="button" className="btn btn-outline btn-sm" onClick={onAddImageBlock}>
          + Image block
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onAddVideoBlock}>
          + Video block
        </button>
        <span className="post-media-count">
          {inContent.length ? `${inContent.length} in content` : 'No extra media in content yet'}
        </span>
      </div>

      {inContent.length > 0 && (
        <ul className="post-media-grid">
          {inContent.map(item => {
            const poster =
              item.kind === 'video' && isVideoEmbedUrl(item.url) ? videoPreviewPoster(item.url) : null;
            const thumb = item.kind === 'image' ? item.url : poster;

            return (
              <li key={`${item.kind}-${item.blockId ?? item.url}`} className="post-media-grid-item">
                <button
                  type="button"
                  className="post-media-grid-thumb"
                  onClick={() => item.blockId && onJumpToBlock?.(item.blockId)}
                  title="Scroll to block in editor"
                >
                  {thumb ? (
                    <img src={thumb} alt="" />
                  ) : (
                    <span className="post-media-grid-video-placeholder">▶ Video</span>
                  )}
                  <span className={`post-media-grid-badge post-media-grid-badge--${item.kind}`}>
                    {item.kind === 'video' ? 'Video' : 'Image'}
                  </span>
                </button>
                <div className="post-media-grid-meta">
                  <p className="post-media-grid-label">{item.label}</p>
                  {item.kind === 'image' && (
                    <button type="button" className="form-link-btn" onClick={() => onFeaturedChange(item.url)}>
                      Set as featured
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
