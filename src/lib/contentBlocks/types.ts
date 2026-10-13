import type { BlockLineHeight, BlockTextAlign } from '@/lib/contentBlocks/typography';

export const CONTENT_BLOCKS_VERSION = 1;

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type { BlockLineHeight, BlockTextAlign };

export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'video'
  | 'link'
  | 'bulletList'
  | 'numberedList'
  | 'callout'
  | 'quote'
  | 'customQuote'
  | 'code'
  | 'divider'
  | 'mythReality'
  | 'prompt'
  | 'table';

export interface ContentBlockBase {
  id: string;
  type: BlockType;
}

export interface HeadingBlock extends ContentBlockBase {
  type: 'heading';
  level: HeadingLevel;
  html: string;
  align?: BlockTextAlign;
  lineHeight?: BlockLineHeight;
}

export interface ParagraphBlock extends ContentBlockBase {
  type: 'paragraph';
  html: string;
  align?: BlockTextAlign;
  lineHeight?: BlockLineHeight;
}

export interface ImageBlock extends ContentBlockBase {
  type: 'image';
  src: string;
  alt: string;
  caption: string;
}

export interface VideoBlock extends ContentBlockBase {
  type: 'video';
  src: string;
  embedUrl: string;
  caption: string;
}

export interface LinkBlock extends ContentBlockBase {
  type: 'link';
  url: string;
  label: string;
  description: string;
}

export interface ListBlock extends ContentBlockBase {
  type: 'bulletList' | 'numberedList';
  items: string[];
}

export interface CalloutBlock extends ContentBlockBase {
  type: 'callout';
  variant: 'info' | 'warning' | 'tip';
  html: string;
  align?: BlockTextAlign;
  lineHeight?: BlockLineHeight;
}

export interface QuoteBlock extends ContentBlockBase {
  type: 'quote';
  html: string;
  cite: string;
  align?: BlockTextAlign;
  lineHeight?: BlockLineHeight;
}

export interface CustomQuoteBlock extends ContentBlockBase {
  type: 'customQuote';
  html: string;
  attribution: string;
  align?: BlockTextAlign;
  lineHeight?: BlockLineHeight;
}

export interface CodeBlock extends ContentBlockBase {
  type: 'code';
  code: string;
  language: string;
}

export interface DividerBlock extends ContentBlockBase {
  type: 'divider';
}

export interface MythRealityBlock extends ContentBlockBase {
  type: 'mythReality';
  myth: string;
  reality: string;
}

export interface PromptBlock extends ContentBlockBase {
  type: 'prompt';
  title: string;
  body: string;
  align?: BlockTextAlign;
  lineHeight?: BlockLineHeight;
}

export interface TableBlock extends ContentBlockBase {
  type: 'table';
  html: string;
}

export type ContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | VideoBlock
  | LinkBlock
  | ListBlock
  | CalloutBlock
  | QuoteBlock
  | CustomQuoteBlock
  | CodeBlock
  | DividerBlock
  | MythRealityBlock
  | PromptBlock
  | TableBlock;

export interface ContentDocument {
  version: number;
  blocks: ContentBlock[];
}

export type BlockDefinition = {
  type: BlockType;
  label: string;
  create: () => ContentBlock;
};
