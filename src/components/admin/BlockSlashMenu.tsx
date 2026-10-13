'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BLOCK_MENU_GROUPS,
  filterBlockMenuItems,
  type BlockMenuItem,
} from '@/lib/contentBlocks/blockMenuMeta';
import type { BlockType, HeadingLevel } from '@/lib/contentBlocks/types';

type BlockSlashMenuProps = {
  onPick: (type: BlockType, headingLevel?: HeadingLevel) => void;
  onClose: () => void;
  title?: string;
  className?: string;
};

export default function BlockSlashMenu({ onPick, onClose, title = 'Insert block', className = '' }: BlockSlashMenuProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => filterBlockMenuItems(query), [query]);

  useEffect(() => {
    inputRef.current?.focus();
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, items.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter') {
        const item = items[activeIndex];
        if (item) {
          e.preventDefault();
          onPick(item.type, item.headingLevel);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, items, onClose, onPick]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const pick = (item: BlockMenuItem) => {
    onPick(item.type, item.headingLevel);
    onClose();
  };

  const grouped = BLOCK_MENU_GROUPS.map(g => ({
    ...g,
    items: items.filter(i => i.group === g.id),
  })).filter(g => g.items.length > 0);

  return (
    <div className={`block-slash-menu block-slash-menu--rich ${className}`} role="dialog" aria-label={title}>
      <div className="block-slash-menu-header">
        <span className="block-slash-menu-title">{title}</span>
        <button type="button" className="block-slash-menu-close" onClick={onClose} aria-label="Close">×</button>
      </div>
      <input
        ref={inputRef}
        type="search"
        className="block-slash-menu-search"
        placeholder="Search blocks…"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <div className="block-slash-menu-list" ref={listRef}>
        {items.length === 0 ? (
          <p className="block-slash-menu-empty">No blocks match your search.</p>
        ) : (
          grouped.map(group => (
            <div key={group.id} className="block-slash-menu-group">
              <p className="block-slash-menu-group-label">{group.label}</p>
              {group.items.map(item => {
                const flatIndex = items.indexOf(item);
                return (
                  <button
                    key={`${item.type}-${item.headingLevel ?? ''}-${item.label}`}
                    type="button"
                    data-index={flatIndex}
                    className={`block-slash-menu-item ${flatIndex === activeIndex ? 'is-active' : ''}`}
                    onMouseEnter={() => setActiveIndex(flatIndex)}
                    onClick={() => pick(item)}
                  >
                    <span className="block-slash-menu-icon">{item.icon}</span>
                    <span className="block-slash-menu-item-text">
                      <span className="block-slash-menu-item-label">{item.label}</span>
                      <span className="block-slash-menu-item-desc">{item.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>
      <p className="block-slash-menu-footer">
        <kbd>↑</kbd> <kbd>↓</kbd> navigate · <kbd>Enter</kbd> select · <kbd>Esc</kbd> close
      </p>
    </div>
  );
}
