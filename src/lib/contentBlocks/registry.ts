import { createBlockId } from '@/lib/contentBlocks/ids';
import type { BlockDefinition, BlockType, ContentBlock, HeadingLevel } from '@/lib/contentBlocks/types';

function heading(level: HeadingLevel): ContentBlock {
  return { id: createBlockId(), type: 'heading', level, html: '' };
}

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  { type: 'heading', label: 'Heading', create: () => heading(2) },
  { type: 'paragraph', label: 'Paragraph', create: () => ({ id: createBlockId(), type: 'paragraph', html: '' }) },
  { type: 'image', label: 'Image', create: () => ({ id: createBlockId(), type: 'image', src: '', alt: '', caption: '' }) },
  { type: 'video', label: 'Video', create: () => ({ id: createBlockId(), type: 'video', src: '', embedUrl: '', caption: '' }) },
  { type: 'link', label: 'Link', create: () => ({ id: createBlockId(), type: 'link', url: '', label: '', description: '' }) },
  { type: 'bulletList', label: 'Bullet list', create: () => ({ id: createBlockId(), type: 'bulletList', items: [''] }) },
  { type: 'numberedList', label: 'Numbered list', create: () => ({ id: createBlockId(), type: 'numberedList', items: [''] }) },
  { type: 'callout', label: 'Callout', create: () => ({ id: createBlockId(), type: 'callout', variant: 'info', html: '' }) },
  { type: 'quote', label: 'Quote', create: () => ({ id: createBlockId(), type: 'quote', html: '', cite: '' }) },
  { type: 'customQuote', label: 'Custom quote', create: () => ({ id: createBlockId(), type: 'customQuote', html: '', attribution: '' }) },
  { type: 'code', label: 'Code block', create: () => ({ id: createBlockId(), type: 'code', code: '', language: '' }) },
  { type: 'divider', label: 'Divider', create: () => ({ id: createBlockId(), type: 'divider' }) },
  { type: 'mythReality', label: 'Myth vs reality', create: () => ({ id: createBlockId(), type: 'mythReality', myth: '', reality: '' }) },
  { type: 'prompt', label: 'Prompt', create: () => ({ id: createBlockId(), type: 'prompt', title: '', body: '' }) },
  { type: 'table', label: 'Table', create: () => ({ id: createBlockId(), type: 'table', html: '' }) },
];

export const HEADING_LEVEL_OPTIONS: { level: HeadingLevel; label: string }[] = [
  { level: 1, label: 'H1' },
  { level: 2, label: 'H2' },
  { level: 3, label: 'H3' },
  { level: 4, label: 'H4' },
  { level: 5, label: 'H5' },
  { level: 6, label: 'H6' },
];

export function createBlockByType(type: BlockType, headingLevel?: HeadingLevel): ContentBlock {
  if (type === 'heading') {
    return heading(headingLevel ?? 2);
  }
  const def = BLOCK_DEFINITIONS.find(d => d.type === type);
  if (!def) {
    return { id: createBlockId(), type: 'paragraph', html: '' };
  }
  return def.create();
}

export function blockTypeLabel(type: BlockType): string {
  return BLOCK_DEFINITIONS.find(d => d.type === type)?.label ?? type;
}
