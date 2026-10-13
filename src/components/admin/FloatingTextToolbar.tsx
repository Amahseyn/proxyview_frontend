'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  FloatingToolbarButton,
  IconAlignCenter,
  IconAlignJustify,
  IconAlignLeft,
  IconAlignRight,
  IconBlocks,
  IconBold,
  IconBulletList,
  IconClearFormat,
  IconCode,
  IconHighlight,
  IconImage,
  IconItalic,
  IconLink,
  IconNumberedList,
  IconRedo,
  IconStrikethrough,
  IconSubscript,
  IconSuperscript,
  IconTextColor,
  IconUnderline,
  IconUndo,
  IconUnlink,
} from '@/components/admin/floatingToolbarIcons';

type FloatingTextToolbarProps = {
  containerRef: React.RefObject<HTMLElement | null>;
  onImageUpload?: (files: File[]) => void;
  isUploadingImage?: boolean;
  onOpenBlockMenu?: () => void;
};

const HIGHLIGHT_COLOR = '#FFE300';
const DEFAULT_TEXT_COLOR = '#003135';
const VIEWPORT_MARGIN = 12;
const SELECTION_GAP = 10;

type AnchorRect = { top: number; left: number; width: number; height: number; bottom: number };

function computeToolbarCoords(anchor: AnchorRect, toolbarEl: HTMLElement) {
  const tw = toolbarEl.offsetWidth;
  const th = toolbarEl.offsetHeight;
  const centerX = anchor.left + anchor.width / 2;
  const left = Math.min(
    window.innerWidth - VIEWPORT_MARGIN - tw / 2,
    Math.max(VIEWPORT_MARGIN + tw / 2, centerX),
  );

  const spaceAbove = anchor.top - VIEWPORT_MARGIN;
  const spaceBelow = window.innerHeight - anchor.bottom - VIEWPORT_MARGIN;
  const placement: 'above' | 'below' =
    spaceAbove >= th + SELECTION_GAP || spaceAbove >= spaceBelow ? 'above' : 'below';
  const top = placement === 'above' ? anchor.top - SELECTION_GAP : anchor.bottom + SELECTION_GAP;

  return { top, left, placement };
}

export default function FloatingTextToolbar({
  containerRef,
  onImageUpload,
  isUploadingImage = false,
  onOpenBlockMenu,
}: FloatingTextToolbarProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [anchorRect, setAnchorRect] = useState<AnchorRect | null>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [placement, setPlacement] = useState<'above' | 'below'>('above');
  const [active, setActive] = useState<Record<string, boolean>>({});

  const syncFromSelection = useCallback(() => {
    const root = containerRef.current;
    const sel = window.getSelection();
    if (!root || !sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setVisible(false);
      setAnchorRect(null);
      return;
    }

    const anchor = sel.anchorNode;
    if (!anchor || !root.contains(anchor)) {
      setVisible(false);
      setAnchorRect(null);
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (!rect.width && !rect.height) {
      setVisible(false);
      setAnchorRect(null);
      return;
    }

    setAnchorRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      bottom: rect.bottom,
    });
    setActive({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
      justifyFull: document.queryCommandState('justifyFull'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
    });
    setVisible(true);
  }, [containerRef]);

  useEffect(() => {
    document.addEventListener('selectionchange', syncFromSelection);
    window.addEventListener('scroll', syncFromSelection, true);
    window.addEventListener('resize', syncFromSelection);
    return () => {
      document.removeEventListener('selectionchange', syncFromSelection);
      window.removeEventListener('scroll', syncFromSelection, true);
      window.removeEventListener('resize', syncFromSelection);
    };
  }, [syncFromSelection]);

  useLayoutEffect(() => {
    if (!visible || !anchorRect || !toolbarRef.current) return;
    const next = computeToolbarCoords(anchorRect, toolbarRef.current);
    setCoords({ top: next.top, left: next.left });
    setPlacement(next.placement);
  }, [visible, anchorRect, active]);

  const run = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
  };

  const wrapInlineCode = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const code = document.createElement('code');
    try {
      code.appendChild(range.extractContents());
      range.insertNode(code);
      range.setStartAfter(code);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } catch {
      run('insertHTML', `<code>${range.toString()}</code>`);
    }
  };

  const pickTextColor = () => {
    const value = window.prompt('Text color (hex)', DEFAULT_TEXT_COLOR);
    if (value) run('foreColor', value);
  };

  if (!visible) return null;

  return (
    <div
      ref={toolbarRef}
      className={`floating-text-toolbar floating-text-toolbar--wide floating-text-toolbar--${placement}`}
      style={{ top: coords.top, left: coords.left }}
      role="toolbar"
      aria-label="Text formatting"
      onMouseDown={e => e.preventDefault()}
    >
      <FloatingToolbarButton label="Undo" shortcut="Ctrl+Z" onClick={() => run('undo')}>
        <IconUndo />
      </FloatingToolbarButton>
      <FloatingToolbarButton label="Redo" shortcut="Ctrl+Y" onClick={() => run('redo')}>
        <IconRedo />
      </FloatingToolbarButton>
      <span className="floating-text-toolbar-divider" />

      <FloatingToolbarButton label="Bold" shortcut="Ctrl+B" active={active.bold} onClick={() => run('bold')}>
        <IconBold />
      </FloatingToolbarButton>
      <FloatingToolbarButton label="Italic" shortcut="Ctrl+I" active={active.italic} onClick={() => run('italic')}>
        <IconItalic />
      </FloatingToolbarButton>
      <FloatingToolbarButton label="Underline" shortcut="Ctrl+U" active={active.underline} onClick={() => run('underline')}>
        <IconUnderline />
      </FloatingToolbarButton>
      <FloatingToolbarButton label="Strikethrough" active={active.strikeThrough} onClick={() => run('strikeThrough')}>
        <IconStrikethrough />
      </FloatingToolbarButton>
      <span className="floating-text-toolbar-divider" />

      <FloatingToolbarButton label="Align left" active={active.justifyLeft} onClick={() => run('justifyLeft')}>
        <IconAlignLeft />
      </FloatingToolbarButton>
      <FloatingToolbarButton label="Align center" active={active.justifyCenter} onClick={() => run('justifyCenter')}>
        <IconAlignCenter />
      </FloatingToolbarButton>
      <FloatingToolbarButton label="Align right" active={active.justifyRight} onClick={() => run('justifyRight')}>
        <IconAlignRight />
      </FloatingToolbarButton>
      <FloatingToolbarButton label="Justify" active={active.justifyFull} onClick={() => run('justifyFull')}>
        <IconAlignJustify />
      </FloatingToolbarButton>
      <span className="floating-text-toolbar-divider" />

      <FloatingToolbarButton label="Bullet list" onClick={() => run('insertUnorderedList')} active={active.insertUnorderedList}>
        <IconBulletList />
      </FloatingToolbarButton>
      <FloatingToolbarButton label="Numbered list" onClick={() => run('insertOrderedList')} active={active.insertOrderedList}>
        <IconNumberedList />
      </FloatingToolbarButton>
      <span className="floating-text-toolbar-divider" />

      <FloatingToolbarButton label="Superscript" onClick={() => run('superscript')}>
        <IconSuperscript />
      </FloatingToolbarButton>
      <FloatingToolbarButton label="Subscript" onClick={() => run('subscript')}>
        <IconSubscript />
      </FloatingToolbarButton>
      <FloatingToolbarButton label="Inline code" onClick={wrapInlineCode}>
        <IconCode />
      </FloatingToolbarButton>
      <FloatingToolbarButton label="Highlight" onClick={() => run('hiliteColor', HIGHLIGHT_COLOR)}>
        <IconHighlight />
      </FloatingToolbarButton>
      <FloatingToolbarButton label="Text color" onClick={pickTextColor}>
        <IconTextColor />
      </FloatingToolbarButton>
      <span className="floating-text-toolbar-divider" />

      {onOpenBlockMenu ? (
        <>
          <FloatingToolbarButton label="All block types" onClick={onOpenBlockMenu}>
            <IconBlocks />
          </FloatingToolbarButton>
          <span className="floating-text-toolbar-divider" />
        </>
      ) : null}

      {onImageUpload ? (
        <>
          <FloatingToolbarButton
            label="Upload images"
            disabled={isUploadingImage}
            onClick={() => imageInputRef.current?.click()}
          >
            <IconImage />
          </FloatingToolbarButton>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            disabled={isUploadingImage}
            onChange={e => {
              const picked = e.target.files ? Array.from(e.target.files) : [];
              if (picked.length) onImageUpload(picked);
              e.target.value = '';
            }}
          />
          <span className="floating-text-toolbar-divider" />
        </>
      ) : null}

      <FloatingToolbarButton
        label="Insert link"
        shortcut="Ctrl+K"
        onClick={() => {
          const url = window.prompt('Link URL');
          if (url) run('createLink', url);
        }}
      >
        <IconLink />
      </FloatingToolbarButton>
      <FloatingToolbarButton label="Remove link" onClick={() => run('unlink')}>
        <IconUnlink />
      </FloatingToolbarButton>
      <FloatingToolbarButton label="Clear formatting" onClick={() => run('removeFormat')}>
        <IconClearFormat />
      </FloatingToolbarButton>
    </div>
  );
}
