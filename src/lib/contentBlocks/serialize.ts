import { normalizeBlogPostHtml } from '@/lib/richTextTable';
import { typographyClassNames, typographyInlineStyle } from '@/lib/contentBlocks/typography';
import { CONTENT_BLOCKS_VERSION, type ContentBlock, type ContentDocument } from '@/lib/contentBlocks/types';

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderListItems(items: string[], ordered: boolean): string {
  const tag = ordered ? 'ol' : 'ul';
  const lis = items
    .filter(item => item.trim())
    .map(item => `<li>${item}</li>`)
    .join('');
  return lis ? `<${tag}>${lis}</${tag}>` : '';
}

function videoEmbedHtml(block: Extract<ContentBlock, { type: 'video' }>): string {
  const embed = block.embedUrl.trim();
  const src = block.src.trim();
  if (embed) {
    if (embed.includes('<iframe')) return embed;
    return `<div class="pv-video-embed"><iframe src="${escapeAttr(embed)}" title="Video" allowfullscreen loading="lazy"></iframe></div>`;
  }
  if (src) {
    return `<div class="pv-video-file"><video controls preload="metadata" src="${escapeAttr(src)}"></video></div>`;
  }
  return '';
}

export function blockToHtml(block: ContentBlock): string {
  switch (block.type) {
    case 'heading': {
      const level = block.level;
      const inner = block.html.trim() || '<br>';
      const cls = typographyClassNames(block.align, block.lineHeight);
      const style = typographyInlineStyle(block.lineHeight);
      const alignStyle = block.align ? `text-align:${block.align};` : '';
      return `<h${level} class="${cls}" style="${alignStyle}${style}">${inner}</h${level}>`;
    }
    case 'paragraph': {
      if (!block.html.trim()) return '';
      const cls = typographyClassNames(block.align, block.lineHeight);
      const style = typographyInlineStyle(block.lineHeight);
      const alignStyle = block.align ? `text-align:${block.align};` : '';
      return `<div class="${cls}" style="${alignStyle}${style}"><p>${block.html}</p></div>`;
    }
    case 'image': {
      if (!block.src.trim()) return '';
      const alt = escapeAttr(block.alt);
      const cap = block.caption.trim();
      const img = `<img src="${escapeAttr(block.src)}" alt="${alt}" loading="lazy" />`;
      return cap
        ? `<figure class="pv-figure">${img}<figcaption>${escapeHtml(cap)}</figcaption></figure>`
        : `<figure class="pv-figure">${img}</figure>`;
    }
    case 'video': {
      const media = videoEmbedHtml(block);
      if (!media) return '';
      const cap = block.caption.trim();
      return cap
        ? `<figure class="pv-figure pv-figure-video">${media}<figcaption>${escapeHtml(cap)}</figcaption></figure>`
        : media;
    }
    case 'link': {
      if (!block.url.trim()) return '';
      const label = block.label.trim() || block.url;
      const desc = block.description.trim();
      return `<aside class="pv-link-card"><a href="${escapeAttr(block.url)}" rel="noopener noreferrer">${escapeHtml(label)}</a>${desc ? `<p>${escapeHtml(desc)}</p>` : ''}</aside>`;
    }
    case 'bulletList':
      return renderListItems(block.items, false);
    case 'numberedList':
      return renderListItems(block.items, true);
    case 'callout': {
      if (!block.html.trim()) return '';
      const cls = `pv-callout pv-callout--${block.variant} ${typographyClassNames(block.align, block.lineHeight)}`;
      const style = `${block.align ? `text-align:${block.align};` : ''}${typographyInlineStyle(block.lineHeight)}`;
      return `<aside class="${cls}" style="${style}">${block.html}</aside>`;
    }
    case 'quote': {
      const cite = block.cite.trim();
      const inner = block.html.trim();
      if (!inner) return '';
      const cls = typographyClassNames(block.align, block.lineHeight);
      const style = `${block.align ? `text-align:${block.align};` : ''}${typographyInlineStyle(block.lineHeight)}`;
      return cite
        ? `<blockquote class="${cls}" style="${style}"><p>${inner}</p><cite>${escapeHtml(cite)}</cite></blockquote>`
        : `<blockquote class="${cls}" style="${style}"><p>${inner}</p></blockquote>`;
    }
    case 'customQuote': {
      if (!block.html.trim()) return '';
      const attr = block.attribution.trim();
      const cls = `pv-custom-quote ${typographyClassNames(block.align, block.lineHeight)}`;
      const style = `${block.align ? `text-align:${block.align};` : ''}${typographyInlineStyle(block.lineHeight)}`;
      return `<figure class="${cls}" style="${style}"><blockquote>${block.html}</blockquote>${attr ? `<figcaption>${escapeHtml(attr)}</figcaption>` : ''}</figure>`;
    }
    case 'code': {
      if (!block.code.trim()) return '';
      const lang = block.language.trim();
      return lang
        ? `<pre><code class="language-${escapeAttr(lang)}">${escapeHtml(block.code)}</code></pre>`
        : `<pre><code>${escapeHtml(block.code)}</code></pre>`;
    }
    case 'divider':
      return '<hr class="pv-divider" />';
    case 'mythReality': {
      if (!block.myth.trim() && !block.reality.trim()) return '';
      return `<div class="pv-myth-reality"><div class="pv-myth"><span class="pv-myth-label">Myth</span><p>${escapeHtml(block.myth)}</p></div><div class="pv-reality"><span class="pv-reality-label">Reality</span><p>${escapeHtml(block.reality)}</p></div></div>`;
    }
    case 'prompt': {
      if (!block.title.trim() && !block.body.trim()) return '';
      const cls = `pv-prompt ${typographyClassNames(block.align, block.lineHeight)}`;
      const style = `${block.align ? `text-align:${block.align};` : ''}${typographyInlineStyle(block.lineHeight)}`;
      return `<aside class="${cls}" style="${style}"><p class="pv-prompt-title">${escapeHtml(block.title)}</p><div class="pv-prompt-body">${block.body}</div></aside>`;
    }
    case 'table':
      return block.html.trim() ? block.html : '';
    default:
      return '';
  }
}

export function blocksToHtml(blocks: ContentBlock[]): string {
  const html = blocks.map(blockToHtml).filter(Boolean).join('\n');
  return normalizeBlogPostHtml(html);
}

export function serializeDocument(blocks: ContentBlock[]): string {
  const doc: ContentDocument = { version: CONTENT_BLOCKS_VERSION, blocks };
  return JSON.stringify(doc);
}

export function parseDocument(json: string): ContentDocument | null {
  if (!json?.trim()) return null;
  try {
    const parsed = JSON.parse(json) as ContentDocument;
    if (parsed?.version !== CONTENT_BLOCKS_VERSION || !Array.isArray(parsed.blocks)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function documentFromHtml(html: string): ContentDocument {
  const trimmed = html?.trim() ?? '';
  if (!trimmed) {
    return { version: CONTENT_BLOCKS_VERSION, blocks: [{ id: 'legacy', type: 'paragraph', html: '' }] };
  }
  return {
    version: CONTENT_BLOCKS_VERSION,
    blocks: [{ id: 'legacy-html', type: 'paragraph', html: trimmed }],
  };
}

export function loadEditorDocument(blocksJson: string, contentHtml: string): ContentDocument {
  const fromJson = parseDocument(blocksJson);
  if (fromJson && fromJson.blocks.length > 0) return fromJson;
  return documentFromHtml(contentHtml);
}
