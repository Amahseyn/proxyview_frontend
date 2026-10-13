export type BlockTextAlign = 'left' | 'center' | 'right' | 'justify';

/** Relative line-height multipliers */
export type BlockLineHeight = '1.35' | '1.55' | '1.75' | '2' | '2.25';

export const LINE_HEIGHT_OPTIONS: { value: BlockLineHeight; label: string }[] = [
  { value: '1.35', label: 'Tight' },
  { value: '1.55', label: 'Normal' },
  { value: '1.75', label: 'Relaxed' },
  { value: '2', label: 'Loose' },
  { value: '2.25', label: 'Extra loose' },
];

export const TEXT_ALIGN_OPTIONS: { value: BlockTextAlign; label: string; icon: string }[] = [
  { value: 'left', label: 'Align left', icon: '⫷' },
  { value: 'center', label: 'Align center', icon: '≡' },
  { value: 'right', label: 'Align right', icon: '⫸' },
  { value: 'justify', label: 'Justify', icon: '▥' },
];

export function typographyClassNames(align?: BlockTextAlign, lineHeight?: BlockLineHeight): string {
  const parts: string[] = ['pv-typography'];
  if (align && align !== 'left') parts.push(`pv-align-${align}`);
  if (lineHeight) parts.push(`pv-lh-${lineHeight.replace('.', '')}`);
  return parts.join(' ');
}

export function typographyInlineStyle(lineHeight?: BlockLineHeight): string {
  if (!lineHeight) return '';
  return `line-height:${lineHeight};`;
}

export function hasTypographyControls(block: { type: string }): boolean {
  return (
    block.type === 'paragraph' ||
    block.type === 'heading' ||
    block.type === 'callout' ||
    block.type === 'quote' ||
    block.type === 'customQuote' ||
    block.type === 'prompt'
  );
}

export function getBlockTypography(block: {
  type: string;
  align?: BlockTextAlign;
  lineHeight?: BlockLineHeight;
}): { align?: BlockTextAlign; lineHeight?: BlockLineHeight } {
  return { align: block.align, lineHeight: block.lineHeight };
}

export function setBlockTypography<T extends { align?: BlockTextAlign; lineHeight?: BlockLineHeight }>(
  block: T,
  patch: Partial<{ align: BlockTextAlign; lineHeight: BlockLineHeight }>
): T {
  return { ...block, ...patch };
}
