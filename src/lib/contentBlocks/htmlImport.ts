import { createBlockId } from '@/lib/contentBlocks/ids';
import { CONTENT_BLOCKS_VERSION, type ContentBlock, type ContentDocument } from '@/lib/contentBlocks/types';

/** Best-effort conversion of legacy HTML posts into editable blocks (client-only). */
export function htmlToBlocks(html: string): ContentDocument {
  const trimmed = html?.trim() ?? '';
  if (!trimmed) {
    return { version: CONTENT_BLOCKS_VERSION, blocks: [{ id: createBlockId(), type: 'paragraph', html: '' }] };
  }

  if (typeof DOMParser === 'undefined') {
    return {
      version: CONTENT_BLOCKS_VERSION,
      blocks: [{ id: createBlockId(), type: 'paragraph', html: trimmed }],
    };
  }

  const doc = new DOMParser().parseFromString(trimmed, 'text/html');
  const blocks: ContentBlock[] = [];

  const pushParagraph = (inner: string) => {
    if (!inner.trim()) return;
    blocks.push({ id: createBlockId(), type: 'paragraph', html: inner });
  };

  for (const node of Array.from(doc.body.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) pushParagraph(text);
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (/^h[1-6]$/.test(tag)) {
      const level = Number(tag[1]) as 1 | 2 | 3 | 4 | 5 | 6;
      blocks.push({ id: createBlockId(), type: 'heading', level, html: el.innerHTML });
      continue;
    }
    if (tag === 'p') {
      pushParagraph(el.innerHTML);
      continue;
    }
    if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(el.querySelectorAll(':scope > li')).map(li => li.innerHTML);
      blocks.push({
        id: createBlockId(),
        type: tag === 'ol' ? 'numberedList' : 'bulletList',
        items: items.length ? items : [''],
      });
      continue;
    }
    if (tag === 'blockquote') {
      blocks.push({ id: createBlockId(), type: 'quote', html: el.innerHTML, cite: '' });
      continue;
    }
    if (tag === 'pre') {
      blocks.push({ id: createBlockId(), type: 'code', code: el.textContent ?? '', language: '' });
      continue;
    }
    if (tag === 'hr') {
      blocks.push({ id: createBlockId(), type: 'divider' });
      continue;
    }
    if (tag === 'table') {
      blocks.push({ id: createBlockId(), type: 'table', html: el.outerHTML });
      continue;
    }
    if (tag === 'figure') {
      const img = el.querySelector('img');
      if (img) {
        blocks.push({
          id: createBlockId(),
          type: 'image',
          src: img.getAttribute('src') ?? '',
          alt: img.getAttribute('alt') ?? '',
          caption: el.querySelector('figcaption')?.textContent ?? '',
        });
        continue;
      }
    }
    pushParagraph(el.outerHTML);
  }

  if (blocks.length === 0) {
    blocks.push({ id: createBlockId(), type: 'paragraph', html: trimmed });
  }

  return { version: CONTENT_BLOCKS_VERSION, blocks };
}
