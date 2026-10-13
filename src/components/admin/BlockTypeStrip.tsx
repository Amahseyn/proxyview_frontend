'use client';

import { useCallback, useState } from 'react';
import { BLOCK_MENU_ITEMS, type BlockMenuItem } from '@/lib/contentBlocks/blockMenuMeta';
import type { BlockType, HeadingLevel } from '@/lib/contentBlocks/types';

type BlockTypeStripProps = {
  onPick: (type: BlockType, headingLevel?: HeadingLevel) => void;
  label?: string;
};

type HoverTip = {
  title: string;
  description: string;
  x: number;
  y: number;
};

export default function BlockTypeStrip({ onPick, label }: BlockTypeStripProps) {
  const [hoverTip, setHoverTip] = useState<HoverTip | null>(null);

  const pick = (item: BlockMenuItem) => {
    onPick(item.type, item.headingLevel);
    setHoverTip(null);
  };

  const showTip = useCallback((item: BlockMenuItem, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    setHoverTip({
      title: item.label,
      description: item.description,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  }, []);

  return (
    <div className="block-type-strip-wrap">
      {label ? <span className="block-type-strip-label">{label}</span> : null}
      <div className="block-type-strip" role="listbox" aria-label={label ?? 'Block types'}>
        {BLOCK_MENU_ITEMS.map(item => (
          <button
            key={`${item.type}-${item.headingLevel ?? ''}-${item.label}`}
            type="button"
            className="block-type-strip-btn"
            title={`${item.label} — ${item.description}`}
            aria-label={`${item.label}: ${item.description}`}
            onMouseEnter={e => showTip(item, e.currentTarget)}
            onMouseLeave={() => setHoverTip(null)}
            onFocus={e => showTip(item, e.currentTarget)}
            onBlur={() => setHoverTip(null)}
            onClick={() => pick(item)}
          >
            <span className="block-type-strip-btn-icon" aria-hidden>{item.icon}</span>
            <span className="block-type-strip-btn-text">{item.label}</span>
          </button>
        ))}
      </div>

      {hoverTip && (
        <div
          className="block-type-strip-flytip"
          style={{ left: hoverTip.x, top: hoverTip.y }}
          role="tooltip"
        >
          <span className="block-type-strip-flytip-title">{hoverTip.title}</span>
          <span className="block-type-strip-flytip-desc">{hoverTip.description}</span>
        </div>
      )}
    </div>
  );
}
