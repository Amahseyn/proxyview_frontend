'use client';

import { useMemo, useState } from 'react';
import {
  BLOCK_MENU_GROUPS,
  BLOCK_MENU_ITEMS,
  filterBlockMenuItems,
  type BlockMenuItem,
} from '@/lib/contentBlocks/blockMenuMeta';
import type { BlockType, HeadingLevel } from '@/lib/contentBlocks/types';

type BlockTypePickerProps = {
  onPick: (type: BlockType, headingLevel?: HeadingLevel) => void;
  onClose?: () => void;
  title?: string;
};

export default function BlockTypePicker({ onPick, onClose, title = 'Choose a block type' }: BlockTypePickerProps) {
  const [query, setQuery] = useState('');

  const items = useMemo(() => filterBlockMenuItems(query), [query]);

  const grouped = BLOCK_MENU_GROUPS.map(g => ({
    ...g,
    items: items.filter(i => i.group === g.id),
  })).filter(g => g.items.length > 0);

  const pick = (item: BlockMenuItem) => {
    onPick(item.type, item.headingLevel);
    onClose?.();
  };

  return (
    <div className="block-type-picker" role="region" aria-label={title}>
      <div className="block-type-picker-head">
        <h3 className="block-type-picker-title">{title}</h3>
        {onClose && (
          <button type="button" className="block-type-picker-close" onClick={onClose} aria-label="Close picker">
            ×
          </button>
        )}
      </div>
      <input
        type="search"
        className="block-type-picker-search"
        placeholder="Filter block types…"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      {items.length === 0 ? (
        <p className="block-type-picker-empty">No block types match your search.</p>
      ) : (
        <div className="block-type-picker-groups">
          {grouped.map(group => (
            <section key={group.id} className="block-type-picker-group">
              <h4 className="block-type-picker-group-label">{group.label}</h4>
              <div className="block-type-picker-grid">
                {group.items.map(item => (
                  <button
                    key={`${item.type}-${item.headingLevel ?? ''}-${item.label}`}
                    type="button"
                    className="block-type-picker-card"
                    onClick={() => pick(item)}
                  >
                    <span className="block-type-picker-card-icon" aria-hidden>{item.icon}</span>
                    <span className="block-type-picker-card-label">{item.label}</span>
                    <span className="block-type-picker-card-desc">{item.description}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      {!query && (
        <p className="block-type-picker-hint">
          {BLOCK_MENU_ITEMS.length} block types · click one to insert
        </p>
      )}
    </div>
  );
}
