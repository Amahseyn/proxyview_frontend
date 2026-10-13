'use client';

import {
  LINE_HEIGHT_OPTIONS,
  TEXT_ALIGN_OPTIONS,
  type BlockLineHeight,
  type BlockTextAlign,
} from '@/lib/contentBlocks/typography';

type BlockTypographyBarProps = {
  align?: BlockTextAlign;
  lineHeight?: BlockLineHeight;
  onAlign: (align: BlockTextAlign) => void;
  onLineHeight: (lineHeight: BlockLineHeight) => void;
};

export default function BlockTypographyBar({
  align = 'left',
  lineHeight = '1.55',
  onAlign,
  onLineHeight,
}: BlockTypographyBarProps) {
  return (
    <div className="block-typography-bar" role="toolbar" aria-label="Block layout">
      <span className="block-typography-label">Align</span>
      <div className="block-typography-group">
        {TEXT_ALIGN_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`block-typography-btn ${align === opt.value ? 'is-active' : ''}`}
            title={opt.label}
            onClick={() => onAlign(opt.value)}
          >
            {opt.icon}
          </button>
        ))}
      </div>
      <span className="block-typography-divider" />
      <label className="block-typography-line-height">
        <span className="block-typography-label">Line spacing</span>
        <select
          value={lineHeight}
          onChange={e => onLineHeight(e.target.value as BlockLineHeight)}
          className="block-typography-select"
        >
          {LINE_HEIGHT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
