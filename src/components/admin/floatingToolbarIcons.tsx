import type { ReactNode } from 'react';

type IconProps = { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function IconBold({ size = 18 }: IconProps) {
  const p = base(size);
  return (
    <svg {...p} aria-hidden>
      <path d="M6 4h6a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h7a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  );
}

export function IconItalic({ size = 18 }: IconProps) {
  const p = base(size);
  return (
    <svg {...p} aria-hidden>
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  );
}

export function IconUnderline({ size = 18 }: IconProps) {
  const p = base(size);
  return (
    <svg {...p} aria-hidden>
      <path d="M6 4v6a6 6 0 0 0 12 0V4" />
      <line x1="4" y1="20" x2="20" y2="20" />
    </svg>
  );
}

export function IconStrikethrough({ size = 18 }: IconProps) {
  const p = base(size);
  return (
    <svg {...p} aria-hidden>
      <path d="M16 4H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H8" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </svg>
  );
}

export function IconAlignLeft({ size = 18 }: IconProps) {
  const p = base(size);
  return (
    <svg {...p} aria-hidden>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="14" y2="12" />
      <line x1="4" y1="18" x2="18" y2="18" />
    </svg>
  );
}

export function IconAlignCenter({ size = 18 }: IconProps) {
  const p = base(size);
  return (
    <svg {...p} aria-hidden>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="5" y1="18" x2="19" y2="18" />
    </svg>
  );
}

export function IconAlignRight({ size = 18 }: IconProps) {
  const p = base(size);
  return (
    <svg {...p} aria-hidden>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="10" y1="12" x2="20" y2="12" />
      <line x1="6" y1="18" x2="20" y2="18" />
    </svg>
  );
}

export function IconAlignJustify({ size = 18 }: IconProps) {
  const p = base(size);
  return (
    <svg {...p} aria-hidden>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

export function IconSuperscript({ size = 18 }: IconProps) {
  const p = base(size);
  return (
    <svg {...p} aria-hidden>
      <path d="m4 19 8-8" />
      <path d="m12 19 8-8" />
      <path d="M20 5h-4" />
      <path d="M18 3v4" />
    </svg>
  );
}

export function IconSubscript({ size = 18 }: IconProps) {
  const p = base(size);
  return (
    <svg {...p} aria-hidden>
      <path d="m4 5 8 8" />
      <path d="m12 5 8 8" />
      <path d="M20 21h-4" />
      <path d="M18 17v4" />
    </svg>
  );
}

export function IconBlocks({ size = 18 }: IconProps) {
  const p = base(size);
  return (
    <svg {...p} aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function IconImage({ size = 18 }: IconProps) {
  const p = base(size);
  return (
    <svg {...p} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

export function IconLink({ size = 18 }: IconProps) {
  const p = base(size);
  return (
    <svg {...p} aria-hidden>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function IconUnlink({ size = 18 }: IconProps) {
  const p = base(size);
  return (
    <svg {...p} aria-hidden>
      <path d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-7.07-.12l-1.71 1.71" />
      <path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 7.07.12l1.71-1.71" />
      <line x1="8" y1="2" x2="8" y2="5" />
      <line x1="2" y1="8" x2="5" y2="8" />
      <line x1="16" y1="19" x2="16" y2="22" />
      <line x1="19" y1="16" x2="22" y2="16" />
    </svg>
  );
}

export function IconClearFormat({ size = 18 }: IconProps) {
  const p = base(size);
  return (
    <svg {...p} aria-hidden>
      <path d="M4 7V4h16v3" />
      <path d="M9 20h6" />
      <path d="M12 4v16" />
      <line x1="3" y1="21" x2="21" y2="3" />
    </svg>
  );
}

export function IconUndo({ size = 18 }: IconProps) {
  const p = base(size);
  return (
    <svg {...p} aria-hidden>
      <path d="M3 10h10a5 5 0 0 1 5 5v2" />
      <path d="M3 10l4-4" />
      <path d="M3 10l4 4" />
    </svg>
  );
}

export function IconRedo({ size = 18 }: IconProps) {
  const p = base(size);
  return (
    <svg {...p} aria-hidden>
      <path d="M21 10H11a5 5 0 0 0-5 5v2" />
      <path d="M21 10l-4-4" />
      <path d="M21 10l-4 4" />
    </svg>
  );
}

export function IconBulletList({ size = 18 }: IconProps) {
  const p = base(size);
  return (
    <svg {...p} aria-hidden>
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
      <circle cx="5" cy="6" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="5" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconNumberedList({ size = 18 }: IconProps) {
  const p = base(size);
  return (
    <svg {...p} aria-hidden>
      <line x1="10" y1="6" x2="20" y2="6" />
      <line x1="10" y1="12" x2="20" y2="12" />
      <line x1="10" y1="18" x2="20" y2="18" />
      <path d="M4 6h1v4" />
      <path d="M4 10h2" />
      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </svg>
  );
}

export function IconHighlight({ size = 18 }: IconProps) {
  const p = base(size);
  return (
    <svg {...p} aria-hidden>
      <path d="m9 11-6 6v3h3l6-6" />
      <path d="m22 4-8.5 8.5-4-4L18 0l4 4z" />
    </svg>
  );
}

export function IconCode({ size = 18 }: IconProps) {
  const p = base(size);
  return (
    <svg {...p} aria-hidden>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

export function IconTextColor({ size = 18 }: IconProps) {
  const p = base(size);
  return (
    <svg {...p} aria-hidden>
      <path d="M4 20h16" />
      <path d="m6 16 6-12 6 12" />
      <path d="M8 12h8" />
    </svg>
  );
}

type ToolbarButtonProps = {
  label: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
};

export function FloatingToolbarButton({ label, shortcut, active, disabled, onClick, children }: ToolbarButtonProps) {
  const tooltip = shortcut ? `${label} (${shortcut})` : label;
  return (
    <button
      type="button"
      className={active ? 'is-active' : ''}
      aria-label={label}
      data-tooltip={tooltip}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="floating-text-toolbar-icon">{children}</span>
    </button>
  );
}
