import type { BlockType, HeadingLevel } from '@/lib/contentBlocks/types';

export type BlockMenuItem = {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  keywords: string[];
  headingLevel?: HeadingLevel;
  group: 'basic' | 'media' | 'layout' | 'advanced';
};

export const BLOCK_MENU_ITEMS: BlockMenuItem[] = [
  { type: 'paragraph', label: 'Paragraph', description: 'Plain text block', icon: '¶', keywords: ['text', 'p'], group: 'basic' },
  { type: 'heading', label: 'Heading 1', description: 'Large section title', icon: 'H1', keywords: ['title', 'h1'], headingLevel: 1, group: 'basic' },
  { type: 'heading', label: 'Heading 2', description: 'Section title', icon: 'H2', keywords: ['subtitle', 'h2'], headingLevel: 2, group: 'basic' },
  { type: 'heading', label: 'Heading 3', description: 'Subsection', icon: 'H3', keywords: ['h3'], headingLevel: 3, group: 'basic' },
  { type: 'heading', label: 'Heading 4', description: 'Small heading', icon: 'H4', keywords: ['h4'], headingLevel: 4, group: 'basic' },
  { type: 'heading', label: 'Heading 5', description: 'Minor heading', icon: 'H5', keywords: ['h5'], headingLevel: 5, group: 'basic' },
  { type: 'heading', label: 'Heading 6', description: 'Smallest heading', icon: 'H6', keywords: ['h6'], headingLevel: 6, group: 'basic' },
  { type: 'bulletList', label: 'Bullet list', description: 'Unordered list', icon: '•', keywords: ['ul', 'list'], group: 'basic' },
  { type: 'numberedList', label: 'Numbered list', description: 'Ordered list', icon: '1.', keywords: ['ol'], group: 'basic' },
  { type: 'quote', label: 'Quote', description: 'Pull quote with citation', icon: '❝', keywords: ['blockquote'], group: 'basic' },
  { type: 'divider', label: 'Divider', description: 'Horizontal rule', icon: '—', keywords: ['hr', 'line'], group: 'basic' },
  { type: 'image', label: 'Image', description: 'Upload or embed', icon: '🖼', keywords: ['photo', 'picture'], group: 'media' },
  { type: 'video', label: 'Video', description: 'Upload or YouTube/Vimeo', icon: '▶', keywords: ['youtube', 'embed'], group: 'media' },
  { type: 'link', label: 'Link card', description: 'Highlighted link', icon: '🔗', keywords: ['url', 'cta'], group: 'media' },
  { type: 'callout', label: 'Callout', description: 'Info, tip, or warning', icon: '💡', keywords: ['alert', 'note'], group: 'layout' },
  { type: 'customQuote', label: 'Custom quote', description: 'Styled quote block', icon: '✦', keywords: [], group: 'layout' },
  { type: 'mythReality', label: 'Myth vs reality', description: 'Two-column myth bust', icon: '⚖', keywords: ['fact'], group: 'layout' },
  { type: 'prompt', label: 'Prompt', description: 'Highlighted prompt box', icon: '⌘', keywords: ['box'], group: 'layout' },
  { type: 'table', label: 'Table', description: 'Rows and columns', icon: '▦', keywords: ['grid'], group: 'advanced' },
  { type: 'code', label: 'Code', description: 'Syntax-friendly block', icon: '</>', keywords: ['pre'], group: 'advanced' },
];

export const BLOCK_MENU_GROUPS: { id: BlockMenuItem['group']; label: string }[] = [
  { id: 'basic', label: 'Basic' },
  { id: 'media', label: 'Media' },
  { id: 'layout', label: 'Layout' },
  { id: 'advanced', label: 'Advanced' },
];

export function filterBlockMenuItems(query: string): BlockMenuItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return BLOCK_MENU_ITEMS;
  return BLOCK_MENU_ITEMS.filter(
    item =>
      item.label.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.keywords.some(k => k.includes(q))
  );
}
