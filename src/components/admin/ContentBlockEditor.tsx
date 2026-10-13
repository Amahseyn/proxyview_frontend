'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { uploadImage } from '@/lib/api';
import BlockSlashMenu from '@/components/admin/BlockSlashMenu';
import BlockTypographyBar from '@/components/admin/BlockTypographyBar';
import FloatingTextToolbar from '@/components/admin/FloatingTextToolbar';
import { hasTypographyControls, type BlockLineHeight, type BlockTextAlign } from '@/lib/contentBlocks/typography';
import { htmlToBlocks } from '@/lib/contentBlocks/htmlImport';
import { createBlockByType, blockTypeLabel } from '@/lib/contentBlocks/registry';
import { blocksToHtml, parseDocument, serializeDocument } from '@/lib/contentBlocks/serialize';
import type { ContentBlock, ContentDocument, BlockType, HeadingLevel } from '@/lib/contentBlocks/types';
import { getEditorPlainStats } from '@/lib/editorStats';
import { buildTableHtml } from '@/lib/richTextTable';
import { createBlockId } from '@/lib/contentBlocks/ids';
import { isVideoEmbedUrl, videoPreviewPoster } from '@/lib/contentBlocks/postMedia';

export type MediaInsertRequest = { seq: number; type: 'image' | 'video' };

type BlockInsertMenu = { blockId: string; mode: 'add' | 'turn' };

type ContentBlockEditorProps = {
  blocksJson: string;
  contentHtml: string;
  onChange: (payload: { blocksJson: string; contentHtml: string }) => void;
  mediaInsert?: MediaInsertRequest | null;
  onMediaInsertDone?: () => void;
  imageUploadBatch?: { seq: number; files: File[] } | null;
  onImageUploadBatchDone?: () => void;
  scrollToBlockId?: string | null;
  onScrollToBlockDone?: () => void;
};

function isRichEmpty(html: string): boolean {
  const t = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return !t;
}

function RichField({
  value,
  onChange,
  placeholder,
  variant = 'paragraph',
  headingLevel = 2,
  onEnter,
  onBackspaceEmpty,
  onSlash,
  onMarkdownTrigger,
  align,
  lineHeight,
  autoFocus,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  variant?: 'paragraph' | 'heading';
  headingLevel?: HeadingLevel;
  align?: BlockTextAlign;
  lineHeight?: BlockLineHeight;
  onEnter?: () => void;
  onBackspaceEmpty?: () => void;
  onSlash?: () => void;
  onMarkdownTrigger?: (lineText: string) => boolean;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
      const sel = window.getSelection();
      if (sel) {
        const range = document.createRange();
        range.selectNodeContents(ref.current);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }, [autoFocus]);

  const className =
    variant === 'heading'
      ? `block-canvas-input block-canvas-input--h${headingLevel}`
      : 'block-canvas-input';

  const wrapStyle: React.CSSProperties = {
    textAlign: align ?? 'left',
    lineHeight: lineHeight ? parseFloat(lineHeight) : 1.55,
  };

  return (
    <div className={`block-canvas-wrap block-canvas-wrap--${align ?? 'left'}`} style={wrapStyle}>
      <div
        ref={ref}
        className={className}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={e => onChange((e.currentTarget as HTMLDivElement).innerHTML)}
        onKeyDown={e => {
        if (e.key === 'Enter' && onEnter) {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onEnter();
            return;
          }
          e.preventDefault();
          document.execCommand('insertLineBreak');
          onChange((e.currentTarget as HTMLDivElement).innerHTML);
          return;
        }
        if (e.key === 'Backspace' && onBackspaceEmpty && isRichEmpty((e.currentTarget as HTMLDivElement).innerHTML)) {
          e.preventDefault();
          onBackspaceEmpty();
        }
        if (e.key === '/' && onSlash && isRichEmpty((e.currentTarget as HTMLDivElement).innerHTML)) {
          e.preventDefault();
          onSlash();
        }
        if (e.key === ' ' && onMarkdownTrigger) {
          const text = (e.currentTarget as HTMLDivElement).textContent?.trim() ?? '';
          if (onMarkdownTrigger(text)) {
            e.preventDefault();
            onChange('');
            if (ref.current) ref.current.innerHTML = '';
          }
        }
      }}
      />
    </div>
  );
}

function MediaUploadField({
  accept,
  label,
  onUploaded,
  onUploadedMany,
  multiple = false,
  variant = 'button',
}: {
  accept: string;
  label: string;
  onUploaded: (url: string) => void;
  onUploadedMany?: (urls: string[]) => void;
  multiple?: boolean;
  variant?: 'button' | 'dropzone';
}) {
  const [uploading, setUploading] = useState(false);
  const className = variant === 'dropzone' ? 'block-media-dropzone' : 'block-inline-action';

  return (
    <label className={className}>
      {variant === 'dropzone' ? (
        <>
          <span className="block-media-dropzone-icon" aria-hidden>🖼</span>
          <span className="block-media-dropzone-title">{uploading ? 'Uploading…' : label}</span>
          <span className="block-media-dropzone-hint">
            {multiple ? 'Select multiple · PNG, JPG, WebP · max 10MB each' : 'PNG, JPG, WebP · max 10MB'}
          </span>
        </>
      ) : (
        <span>{uploading ? 'Uploading…' : label}</span>
      )}
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        disabled={uploading}
        onChange={async e => {
          const files = e.target.files ? Array.from(e.target.files) : [];
          if (!files.length) return;
          setUploading(true);
          try {
            const urls: string[] = [];
            for (const file of files) {
              const res = await uploadImage(file);
              if (res.success && res.url) urls.push(res.url);
            }
            if (!urls.length) return;
            if (multiple && onUploadedMany) {
              onUploadedMany(urls);
            } else {
              onUploaded(urls[0]);
            }
          } finally {
            setUploading(false);
            e.target.value = '';
          }
        }}
      />
    </label>
  );
}

function BlockBody({
  block,
  onUpdate,
  onEnterAfter,
  onRemoveIfEmpty,
  onRequestSlash,
  onTransformBlock,
  onInsertImageBlocksAfter,
  focusOnMount,
}: {
  block: ContentBlock;
  onUpdate: (next: ContentBlock) => void;
  onEnterAfter: () => void;
  onRemoveIfEmpty: () => void;
  onRequestSlash: () => void;
  onTransformBlock: (type: BlockType, level?: HeadingLevel) => void;
  onInsertImageBlocksAfter?: (urls: string[]) => void;
  focusOnMount?: boolean;
}) {
  const typo =
    'align' in block
      ? { align: block.align as BlockTextAlign | undefined, lineHeight: block.lineHeight as BlockLineHeight | undefined }
      : {};
  const [showMediaDetails, setShowMediaDetails] = useState(false);

  const markdownTrigger = (text: string) => {
    if (block.type !== 'paragraph') return false;
    const map: Record<string, [BlockType, HeadingLevel?]> = {
      '#': ['heading', 1],
      '##': ['heading', 2],
      '###': ['heading', 3],
      '-': ['bulletList'],
      '*': ['bulletList'],
      '1.': ['numberedList'],
    };
    const entry = map[text];
    if (!entry) return false;
    onTransformBlock(entry[0], entry[1]);
    return true;
  };

  switch (block.type) {
    case 'heading':
      return (
        <RichField
          value={block.html}
          onChange={html => onUpdate({ ...block, html })}
          placeholder="Heading"
          variant="heading"
          headingLevel={block.level}
          onEnter={onEnterAfter}
          onBackspaceEmpty={onRemoveIfEmpty}
          onSlash={onRequestSlash}
          align={typo.align}
          lineHeight={typo.lineHeight}
          autoFocus={focusOnMount}
        />
      );
    case 'paragraph':
      return (
        <RichField
          value={block.html}
          onChange={html => onUpdate({ ...block, html })}
          placeholder="Start writing, or type / for blocks…"
          onEnter={onEnterAfter}
          onBackspaceEmpty={onRemoveIfEmpty}
          onSlash={onRequestSlash}
          onMarkdownTrigger={markdownTrigger}
          align={typo.align}
          lineHeight={typo.lineHeight}
          autoFocus={focusOnMount}
        />
      );
    case 'image':
      return (
        <div className="block-special-fields">
          {block.src ? (
            <div className="block-media-preview">
              <img src={block.src} alt={block.alt || ''} />
            </div>
          ) : (
            <div className="block-media-empty">
              <MediaUploadField
                accept="image/*"
                label="Upload images"
                variant="dropzone"
                multiple
                onUploaded={url => onUpdate({ ...block, src: url })}
                onUploadedMany={urls => {
                  onUpdate({ ...block, src: urls[0] });
                  if (urls.length > 1) onInsertImageBlocksAfter?.(urls.slice(1));
                }}
              />
              <input
                className="form-input form-input-sm"
                placeholder="Or paste image URL"
                value={block.src}
                onChange={e => onUpdate({ ...block, src: e.target.value })}
              />
            </div>
          )}
          {block.src && (
            <div className="block-special-actions">
              <MediaUploadField accept="image/*" label="Replace" onUploaded={url => onUpdate({ ...block, src: url })} />
              <button type="button" className="block-inline-action" onClick={() => onUpdate({ ...block, src: '' })}>Remove</button>
              <button type="button" className="block-inline-action" onClick={() => setShowMediaDetails(v => !v)}>
                {showMediaDetails ? 'Hide details' : 'Alt & caption'}
              </button>
            </div>
          )}
          {showMediaDetails && (
            <>
              <input className="form-input form-input-sm" placeholder="Alt text" value={block.alt} onChange={e => onUpdate({ ...block, alt: e.target.value })} />
              <input className="form-input form-input-sm" placeholder="Caption" value={block.caption} onChange={e => onUpdate({ ...block, caption: e.target.value })} />
            </>
          )}
        </div>
      );
    case 'video': {
      const videoUrl = block.embedUrl.trim() || block.src.trim();
      const poster = videoUrl && isVideoEmbedUrl(videoUrl) ? videoPreviewPoster(videoUrl) : null;
      const isFileVideo = block.src.trim() && !block.embedUrl.trim();
      return (
        <div className="block-special-fields block-video-fields">
          {videoUrl ? (
            <div className="block-media-preview block-media-preview--video">
              {isFileVideo ? (
                <video src={block.src} controls className="block-video-player" />
              ) : poster ? (
                <img src={poster} alt="" />
              ) : (
                <div className="block-media-preview-fallback">Embedded video</div>
              )}
            </div>
          ) : (
            <MediaUploadField accept="video/*" label="Upload video file" variant="dropzone" onUploaded={url => onUpdate({ ...block, src: url, embedUrl: '' })} />
          )}
          <input
            className="form-input form-input-sm"
            placeholder="YouTube/Vimeo URL or paste direct video URL"
            value={block.embedUrl || block.src}
            onChange={e => onUpdate({ ...block, embedUrl: e.target.value })}
          />
          {videoUrl && (
            <div className="block-special-actions">
              <MediaUploadField accept="video/*" label="Replace file" onUploaded={url => onUpdate({ ...block, src: url, embedUrl: '' })} />
              <button type="button" className="block-inline-action" onClick={() => onUpdate({ ...block, src: '', embedUrl: '' })}>
                Remove
              </button>
            </div>
          )}
          <input className="form-input form-input-sm" placeholder="Caption (optional)" value={block.caption} onChange={e => onUpdate({ ...block, caption: e.target.value })} />
        </div>
      );
    }
    case 'link':
      return (
        <div className="block-special-fields block-link-card-editor">
          <input className="form-input form-input-sm" placeholder="URL" value={block.url} onChange={e => onUpdate({ ...block, url: e.target.value })} />
          <input className="form-input form-input-sm" placeholder="Link text" value={block.label} onChange={e => onUpdate({ ...block, label: e.target.value })} />
          <input className="form-input form-input-sm" placeholder="Short description (optional)" value={block.description} onChange={e => onUpdate({ ...block, description: e.target.value })} />
        </div>
      );
    case 'bulletList':
    case 'numberedList':
      return (
        <div className="block-special-fields">
          {block.items.map((item, index) => (
            <div key={index} className="block-list-item-row">
              <span className="block-list-marker">{block.type === 'numberedList' ? `${index + 1}.` : '•'}</span>
              <RichField
                value={item}
                onChange={html => {
                  const items = [...block.items];
                  items[index] = html;
                  onUpdate({ ...block, items });
                }}
                placeholder="List item"
                onEnter={() => onUpdate({ ...block, items: [...block.items, ''] })}
              />
            </div>
          ))}
          <button type="button" className="block-inline-action" onClick={() => onUpdate({ ...block, items: [...block.items, ''] })}>
            + Add item
          </button>
        </div>
      );
    case 'callout':
      return (
        <div className={`block-special-fields block-callout-editor block-callout-editor--${block.variant}`}>
          <div className="block-callout-tabs">
            {(['info', 'tip', 'warning'] as const).map(v => (
              <button
                key={v}
                type="button"
                className={block.variant === v ? 'is-active' : ''}
                onClick={() => onUpdate({ ...block, variant: v })}
              >
                {v}
              </button>
            ))}
          </div>
          <RichField
            value={block.html}
            onChange={html => onUpdate({ ...block, html })}
            placeholder="Callout text"
            onEnter={onEnterAfter}
            align={typo.align}
            lineHeight={typo.lineHeight}
          />
        </div>
      );
    case 'quote':
    case 'customQuote':
      return (
        <div className="block-special-fields block-quote-editor">
          <RichField
            value={block.html}
            onChange={html => onUpdate({ ...block, html })}
            placeholder="Quote"
            onEnter={onEnterAfter}
            align={typo.align}
            lineHeight={typo.lineHeight}
          />
          {block.type === 'quote' ? (
            <input className="form-input form-input-sm" placeholder="Citation" value={block.cite} onChange={e => onUpdate({ ...block, cite: e.target.value })} />
          ) : (
            <input className="form-input form-input-sm" placeholder="Attribution" value={block.attribution} onChange={e => onUpdate({ ...block, attribution: e.target.value })} />
          )}
        </div>
      );
    case 'code':
      return (
        <textarea
          className="form-textarea block-code-input"
          rows={6}
          value={block.code}
          onChange={e => onUpdate({ ...block, code: e.target.value })}
          placeholder="// Code block"
          spellCheck={false}
        />
      );
    case 'divider':
      return <hr className="block-divider-preview" />;
    case 'mythReality':
      return (
        <div className="block-myth-grid">
          <label className="block-myth-field">
            <span>Myth</span>
            <textarea className="form-textarea" rows={2} value={block.myth} onChange={e => onUpdate({ ...block, myth: e.target.value })} />
          </label>
          <label className="block-myth-field">
            <span>Reality</span>
            <textarea className="form-textarea" rows={2} value={block.reality} onChange={e => onUpdate({ ...block, reality: e.target.value })} />
          </label>
        </div>
      );
    case 'prompt':
      return (
        <div className="block-special-fields block-prompt-editor">
          <input className="form-input form-input-sm" placeholder="Prompt title" value={block.title} onChange={e => onUpdate({ ...block, title: e.target.value })} />
          <RichField
            value={block.body}
            onChange={body => onUpdate({ ...block, body })}
            placeholder="Prompt body"
            onEnter={onEnterAfter}
            align={typo.align}
            lineHeight={typo.lineHeight}
          />
        </div>
      );
    case 'table':
      return (
        <div className="block-special-fields">
          <button
            type="button"
            className="block-inline-action"
            onClick={() => {
              const rows = Number(window.prompt('Rows', '3') || '3');
              const cols = Number(window.prompt('Columns', '3') || '3');
              onUpdate({ ...block, html: buildTableHtml(rows, cols) });
            }}
          >
            {block.html ? 'Replace table' : 'Insert table'}
          </button>
          {block.html ? <div className="block-table-preview" dangerouslySetInnerHTML={{ __html: block.html }} /> : null}
        </div>
      );
    default:
      return null;
  }
}

export default function ContentBlockEditor({
  blocksJson,
  contentHtml,
  onChange,
  mediaInsert,
  onMediaInsertDone,
  imageUploadBatch,
  onImageUploadBatchDone,
  scrollToBlockId,
  onScrollToBlockDone,
}: ContentBlockEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const initialDoc = useMemo(() => {
    const parsed = parseDocument(blocksJson);
    if (parsed?.blocks.length) return parsed;
    return htmlToBlocks(contentHtml);
  }, []);

  const [blocks, setBlocks] = useState<ContentBlock[]>(
    initialDoc.blocks.length ? initialDoc.blocks : [{ id: createBlockId(), type: 'paragraph', html: '' }]
  );
  const [dragId, setDragId] = useState<string | null>(null);
  const [insertMenu, setInsertMenu] = useState<BlockInsertMenu | null>(null);
  const [focusBlockId, setFocusBlockId] = useState<string | null>(null);
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState<string | null>(null);
  const lastMediaInsertSeq = useRef(0);
  const lastImageUploadBatchSeq = useRef(0);
  const blocksRef = useRef(blocks);
  const focusedRowRef = useRef(focusedRowId);
  blocksRef.current = blocks;
  focusedRowRef.current = focusedRowId;

  const htmlPreview = useMemo(() => blocksToHtml(blocks), [blocks]);
  const stats = useMemo(() => getEditorPlainStats(htmlPreview), [htmlPreview]);

  useEffect(() => {
    if (!focusBlockId) return;
    const timer = window.setTimeout(() => setFocusBlockId(null), 50);
    return () => window.clearTimeout(timer);
  }, [focusBlockId, blocks]);

  useEffect(() => {
    if (!scrollToBlockId) return;
    setFocusedRowId(scrollToBlockId);
    const timer = window.setTimeout(() => {
      document.getElementById(`block-row-${scrollToBlockId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      onScrollToBlockDone?.();
    }, 40);
    return () => window.clearTimeout(timer);
  }, [scrollToBlockId, onScrollToBlockDone]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!editorRef.current?.contains(document.activeElement)) return;
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === 'b') {
        e.preventDefault();
        document.execCommand('bold');
      } else if (key === 'i') {
        e.preventDefault();
        document.execCommand('italic');
      } else if (key === 'u') {
        e.preventDefault();
        document.execCommand('underline');
      } else if (key === 'k') {
        e.preventDefault();
        const url = window.prompt('Link URL');
        if (url) document.execCommand('createLink', false, url);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const emitChange = useCallback(
    (nextBlocks: ContentBlock[]) => {
      const doc: ContentDocument = { version: 1, blocks: nextBlocks };
      onChange({ blocksJson: serializeDocument(nextBlocks), contentHtml: blocksToHtml(nextBlocks) });
    },
    [onChange]
  );

  const updateBlocks = (next: ContentBlock[]) => {
    setBlocks(next);
    emitChange(next);
  };

  useEffect(() => {
    if (!mediaInsert || mediaInsert.seq === lastMediaInsertSeq.current) return;
    lastMediaInsertSeq.current = mediaInsert.seq;
    const block = createBlockByType(mediaInsert.type);
    const next = [...blocks, block];
    setFocusBlockId(block.id);
    setFocusedRowId(block.id);
    setBlocks(next);
    emitChange(next);
    onMediaInsertDone?.();
    const timer = window.setTimeout(() => {
      document.getElementById(`block-row-${block.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by mediaInsert.seq only
  }, [mediaInsert?.seq]);

  const updateBlock = (id: string, next: ContentBlock) => {
    updateBlocks(blocks.map(b => (b.id === id ? next : b)));
  };

  const transformBlock = (id: string, type: BlockType, level?: HeadingLevel) => {
    const next = { ...createBlockByType(type, level), id };
    setFocusBlockId(id);
    updateBlock(id, next);
    setInsertMenu(null);
  };

  const insertBlocksAfter = (id: string | null, newBlocks: ContentBlock[]) => {
    if (!newBlocks.length) return;
    const current = blocksRef.current;
    const last = newBlocks[newBlocks.length - 1];

    if (!id) {
      setFocusBlockId(last.id);
      setFocusedRowId(last.id);
      updateBlocks(current.length ? [...current, ...newBlocks] : newBlocks);
      return;
    }

    const index = current.findIndex(b => b.id === id);
    if (index < 0) {
      setFocusBlockId(last.id);
      setFocusedRowId(last.id);
      updateBlocks([...current, ...newBlocks]);
      return;
    }

    const next = [...current];
    next.splice(index + 1, 0, ...newBlocks);
    setFocusBlockId(last.id);
    setFocusedRowId(last.id);
    updateBlocks(next);
  };

  const insertBlockAfter = (id: string, block: ContentBlock) => {
    insertBlocksAfter(id, [block]);
  };

  const handleImagesUpload = async (files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (!imageFiles.length) return;

    setIsUploadingImage(true);
    setImageUploadProgress(null);
    const urls: string[] = [];
    const failures: string[] = [];

    try {
      for (let i = 0; i < imageFiles.length; i++) {
        setImageUploadProgress(`Uploading ${i + 1}/${imageFiles.length}…`);
        const res = await uploadImage(imageFiles[i]);
        if (res.success && res.url) {
          urls.push(res.url);
        } else {
          failures.push(`${imageFiles[i].name}: ${res.message || 'failed'}`);
        }
      }

      if (!urls.length) {
        window.alert(failures.join('\n') || 'Image upload failed');
        return;
      }

      if (failures.length) {
        window.alert(`Uploaded ${urls.length} image(s). Some failed:\n${failures.join('\n')}`);
      }

      const imageBlocks = urls.map(url => ({ ...createBlockByType('image'), src: url }));
      const anchorId = focusedRowRef.current ?? blocksRef.current[blocksRef.current.length - 1]?.id ?? null;
      insertBlocksAfter(anchorId, imageBlocks);

      const scrollId = imageBlocks[imageBlocks.length - 1].id;
      window.setTimeout(() => {
        document.getElementById(`block-row-${scrollId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 40);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Image upload failed';
      window.alert(message);
    } finally {
      setIsUploadingImage(false);
      setImageUploadProgress(null);
    }
  };

  useEffect(() => {
    if (!imageUploadBatch || imageUploadBatch.seq === lastImageUploadBatchSeq.current) return;
    lastImageUploadBatchSeq.current = imageUploadBatch.seq;
    void handleImagesUpload(imageUploadBatch.files).finally(() => onImageUploadBatchDone?.());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by imageUploadBatch.seq only
  }, [imageUploadBatch?.seq]);

  const replaceBlock = (id: string, type: BlockType, level?: HeadingLevel) => {
    transformBlock(id, type, level);
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 1) {
      updateBlocks([{ id: createBlockId(), type: 'paragraph', html: '' }]);
      return;
    }
    const index = blocks.findIndex(b => b.id === id);
    const next = blocks.filter(b => b.id !== id);
    const focusTarget = next[Math.max(0, index - 1)];
    setFocusBlockId(focusTarget?.id ?? null);
    updateBlocks(next);
  };

  const duplicateBlock = (id: string) => {
    const index = blocks.findIndex(b => b.id === id);
    if (index < 0) return;
    const copy = { ...blocks[index], id: createBlockId() };
    const next = [...blocks];
    next.splice(index + 1, 0, copy);
    setFocusBlockId(copy.id);
    updateBlocks(next);
  };

  const moveBlock = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const fromIndex = blocks.findIndex(b => b.id === fromId);
    const toIndex = blocks.findIndex(b => b.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;
    const next = [...blocks];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    updateBlocks(next);
  };

  const closeInsertMenu = () => setInsertMenu(null);

  const toggleTurnInto = (blockId: string) => {
    setInsertMenu(prev =>
      prev?.blockId === blockId && prev.mode === 'turn' ? null : { blockId, mode: 'turn' },
    );
  };

  const openAddBelowMenu = (blockId: string) => {
    setInsertMenu({ blockId, mode: 'add' });
  };

  const handleInsertBelow = (afterBlockId: string, type: BlockType, headingLevel?: HeadingLevel) => {
    const block = createBlockByType(type, headingLevel);
    insertBlockAfter(afterBlockId, block);
    closeInsertMenu();
    window.setTimeout(() => {
      document.getElementById(`block-row-${block.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 40);
  };

  const handleTurnIntoPick = (type: BlockType, headingLevel?: HeadingLevel) => {
    if (insertMenu?.mode === 'turn') {
      replaceBlock(insertMenu.blockId, type, headingLevel);
    }
    closeInsertMenu();
  };

  const openBlockMenuForFocusedRow = (mode: 'add' | 'turn') => {
    const blockId = focusedRowRef.current ?? blocksRef.current[blocksRef.current.length - 1]?.id;
    if (!blockId) return;
    setInsertMenu({ blockId, mode });
    window.setTimeout(() => {
      document.getElementById(`block-insert-menu-${blockId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 40);
  };

  return (
    <div className="block-editor block-editor--canvas" ref={editorRef}>
      <FloatingTextToolbar
        containerRef={editorRef}
        onImageUpload={files => void handleImagesUpload(files)}
        isUploadingImage={isUploadingImage}
        onOpenBlockMenu={() => openBlockMenuForFocusedRow('turn')}
      />

      <div className="block-editor-chrome">
        <div className="block-editor-chrome-tips">
          <label className="block-editor-chip block-editor-chip--btn">
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={isUploadingImage}
              onChange={e => {
                const picked = e.target.files ? Array.from(e.target.files) : [];
                if (picked.length) void handleImagesUpload(picked);
                e.target.value = '';
              }}
            />
            {imageUploadProgress ?? (isUploadingImage ? 'Uploading images…' : 'Upload images')}
          </label>
          <span className="block-editor-chip">Select text → format</span>
          <span className="block-editor-chip"><kbd>/</kbd> all block types</span>
          <span className="block-editor-chip"><kbd>##</kbd> heading</span>
          <span className="block-editor-chip"><kbd>-</kbd> list</span>
          <span className="block-editor-chip"><kbd>Enter</kbd> new line · <kbd>Ctrl+Enter</kbd> new block</span>
          <span className="block-editor-chip"><kbd>Ctrl+B</kbd> bold</span>
        </div>
      </div>

      <div className="block-editor-list">
        {blocks.map(block => (
          <Fragment key={block.id}>
          <div
            id={`block-row-${block.id}`}
            className={`block-editor-row ${dragId === block.id ? 'is-dragging' : ''} ${focusedRowId === block.id ? 'is-focused' : ''} ${insertMenu?.blockId === block.id && insertMenu.mode === 'turn' ? 'is-turn-active' : ''}`}
            onFocusCapture={() => setFocusedRowId(block.id)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => {
              if (dragId) moveBlock(dragId, block.id);
              setDragId(null);
            }}
          >
            <div className="block-editor-gutter">
              <button
                type="button"
                className="block-gutter-btn block-gutter-btn--drag"
                title="Drag to reorder"
                draggable
                onDragStart={() => setDragId(block.id)}
                onDragEnd={() => setDragId(null)}
              >
                ⠿
              </button>
            </div>

            <div className="block-editor-row-body">
              <div className="block-editor-row-meta">
                <span className="block-type-chip">{blockTypeLabel(block.type)}</span>
                <div className="block-row-actions">
                  <button type="button" className="block-row-action" onClick={() => toggleTurnInto(block.id)}>
                    {insertMenu?.blockId === block.id && insertMenu.mode === 'turn' ? 'Cancel' : 'Turn into'}
                  </button>
                  <button type="button" className="block-row-action" onClick={() => duplicateBlock(block.id)}>Duplicate</button>
                  <button type="button" className="block-row-action block-row-action--danger" onClick={() => removeBlock(block.id)}>Delete</button>
                </div>
              </div>

              {hasTypographyControls(block) && (
                <BlockTypographyBar
                  align={(block as { align?: BlockTextAlign }).align ?? 'left'}
                  lineHeight={(block as { lineHeight?: BlockLineHeight }).lineHeight ?? '1.55'}
                  onAlign={align => updateBlock(block.id, { ...block, align } as ContentBlock)}
                  onLineHeight={lineHeight => updateBlock(block.id, { ...block, lineHeight } as ContentBlock)}
                />
              )}

              <BlockBody
                block={block}
                onUpdate={next => updateBlock(block.id, next)}
                onEnterAfter={() => insertBlockAfter(block.id, createBlockByType('paragraph'))}
                onRemoveIfEmpty={() => removeBlock(block.id)}
                onRequestSlash={() => toggleTurnInto(block.id)}
                onTransformBlock={(type, level) => transformBlock(block.id, type, level)}
                onInsertImageBlocksAfter={urls => {
                  const extra = urls.map(url => ({ ...createBlockByType('image'), src: url }));
                  insertBlocksAfter(block.id, extra);
                }}
                focusOnMount={focusBlockId === block.id}
              />
            </div>
          </div>

          <div
            id={`block-insert-menu-${block.id}`}
            className={`block-insert-zone ${insertMenu?.blockId === block.id ? 'block-insert-zone--open' : ''} ${insertMenu?.blockId === block.id && insertMenu.mode === 'turn' ? 'block-insert-zone--turn' : ''}`}
          >
            {insertMenu?.blockId === block.id ? (
              <BlockSlashMenu
                className="block-slash-menu--embed"
                title={insertMenu.mode === 'turn' ? 'Change block type' : 'Add block below'}
                onPick={(type, level) => {
                  if (insertMenu.mode === 'turn') {
                    handleTurnIntoPick(type, level);
                  } else {
                    handleInsertBelow(block.id, type, level);
                  }
                }}
                onClose={closeInsertMenu}
              />
            ) : (
              <button type="button" className="block-insert-add-btn" onClick={() => openAddBelowMenu(block.id)}>
                + Add block below
              </button>
            )}
          </div>
          </Fragment>
        ))}
      </div>

      <footer className="block-editor-footer">
        <span>{stats.words} words</span>
        <span className="block-editor-footer-dot">·</span>
        <span>{stats.characters} characters</span>
        <span className="block-editor-footer-dot">·</span>
        <span>~{stats.readingMinutes} min read</span>
        <span className="block-editor-footer-dot">·</span>
        <span>{blocks.length} blocks</span>
      </footer>
    </div>
  );
}
