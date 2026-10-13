import { createBlockId } from '@/lib/contentBlocks/ids';

export type PostTocHeadingLevel = 2 | 3;

export interface PostTocItem {
  id: string;
  label: string;
  anchor: string;
  level: PostTocHeadingLevel;
}

export interface PostTocDocument {
  sectionTitle: string;
  items: PostTocItem[];
}

export const DEFAULT_TOC_SECTION_TITLE = 'Table of contents';

export function emptyPostTocDocument(): PostTocDocument {
  return { sectionTitle: DEFAULT_TOC_SECTION_TITLE, items: [] };
}

export function anchorFromLabel(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return base || 'section';
}

function uniqueAnchor(base: string, used: Set<string>): string {
  let candidate = base;
  let n = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  used.add(candidate);
  return candidate;
}

export function createPostTocItem(
  partial?: Partial<Pick<PostTocItem, 'label' | 'anchor' | 'level'>>,
): PostTocItem {
  const label = partial?.label ?? '';
  const anchor = partial?.anchor?.trim() || anchorFromLabel(label);
  return {
    id: createBlockId(),
    label,
    anchor,
    level: partial?.level === 3 ? 3 : 2,
  };
}

export function parsePostToc(tocJson: string | undefined | null): PostTocDocument {
  if (!tocJson?.trim()) return emptyPostTocDocument();
  try {
    const data = JSON.parse(tocJson) as Partial<PostTocDocument>;
    const sectionTitle =
      typeof data.sectionTitle === 'string' && data.sectionTitle.trim()
        ? data.sectionTitle.trim()
        : DEFAULT_TOC_SECTION_TITLE;
    const items = Array.isArray(data.items)
      ? data.items
          .filter(item => item && typeof item === 'object')
          .map(item => {
            const row = item as Partial<PostTocItem>;
            const label = typeof row.label === 'string' ? row.label : '';
            const anchor =
              typeof row.anchor === 'string' && row.anchor.trim()
                ? row.anchor.trim()
                : anchorFromLabel(label);
            const level: PostTocHeadingLevel = row.level === 3 ? 3 : 2;
            return {
              id: typeof row.id === 'string' && row.id ? row.id : createBlockId(),
              label,
              anchor,
              level,
            };
          })
      : [];
    return { sectionTitle, items };
  } catch {
    return emptyPostTocDocument();
  }
}

export function serializePostToc(doc: PostTocDocument): string {
  return JSON.stringify({
    sectionTitle: doc.sectionTitle.trim() || DEFAULT_TOC_SECTION_TITLE,
    items: doc.items.map(item => ({
      id: item.id,
      label: item.label,
      anchor: item.anchor.trim() || anchorFromLabel(item.label),
      level: item.level === 3 ? 3 : 2,
    })),
  });
}

export function hasPostTocContent(doc: PostTocDocument): boolean {
  return doc.items.some(item => item.label.trim());
}

export function getPublishedTocItems(doc: PostTocDocument): PostTocItem[] {
  return doc.items
    .filter(item => item.label.trim())
    .map(item => ({
      ...item,
      label: item.label.trim(),
      anchor: item.anchor.trim() || anchorFromLabel(item.label),
    }));
}

function stripHtmlText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeHeadingText(text: string): string {
  return stripHtmlText(text).toLowerCase();
}

export function extractTocFromHtml(html: string): PostTocItem[] {
  if (!html?.trim()) return [];
  const usedAnchors = new Set<string>();
  const items: PostTocItem[] = [];
  const regex = /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const level = match[1] === '3' ? 3 : 2;
    const label = stripHtmlText(match[3]);
    if (!label) continue;
    const anchor = uniqueAnchor(anchorFromLabel(label), usedAnchors);
    items.push(createPostTocItem({ label, anchor, level }));
  }
  return items;
}

export function extractTocFromLegacyMarkdown(content: string): PostTocItem[] {
  if (!content?.trim()) return [];
  const usedAnchors = new Set<string>();
  const items: PostTocItem[] = [];
  for (const block of content.split('\n\n')) {
    const h2 = block.match(/^## (.+)$/);
    const h3 = block.match(/^### (.+)$/);
    const raw = h2?.[1] ?? h3?.[1];
    if (!raw) continue;
    const level: PostTocHeadingLevel = h3 ? 3 : 2;
    const label = raw.trim();
    const anchor = uniqueAnchor(anchorFromLabel(label), usedAnchors);
    items.push(createPostTocItem({ label, anchor, level }));
  }
  return items;
}

export function findTocAnchorForHeading(
  label: string,
  level: PostTocHeadingLevel,
  items: PostTocItem[],
): string | undefined {
  const target = normalizeHeadingText(label);
  const item = items.find(
    i => i.level === level && normalizeHeadingText(i.label) === target,
  );
  return item?.anchor;
}

/** Add id attributes on h2/h3 so in-page TOC links work. */
export function applyTocAnchorsToHtml(html: string, items: PostTocItem[]): string {
  if (!items.length || !html) return html;

  const pending = [...items];

  return html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (full, levelStr, attrs, inner) => {
    const level = levelStr === '3' ? 3 : 2;
    const plain = stripHtmlText(inner);
    let index = pending.findIndex(
      item => item.level === level && normalizeHeadingText(item.label) === normalizeHeadingText(plain),
    );
    if (index === -1 && pending.length && pending[0].level === level) {
      index = 0;
    }
    if (index === -1) return full;

    const item = pending[index];
    pending.splice(index, 1);
    const safeAnchor = item.anchor.replace(/"/g, '');
    const attrsWithoutId = String(attrs).replace(/\sid=(['"])[^'"]*\1/i, '');
    return `<h${level}${attrsWithoutId} id="${safeAnchor}">${inner}</h${level}>`;
  });
}
