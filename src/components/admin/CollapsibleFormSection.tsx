'use client';

import { useState } from 'react';

type CollapsibleFormSectionProps = {
  title: string;
  hint?: string;
  icon?: string;
  defaultOpen?: boolean;
  variant?: 'default' | 'sidebar';
  children: React.ReactNode;
};

export default function CollapsibleFormSection({
  title,
  hint,
  icon,
  defaultOpen = false,
  variant = 'default',
  children,
}: CollapsibleFormSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`form-panel form-panel--${variant} ${open ? 'is-open' : ''}`}>
      <button type="button" className="form-panel-toggle" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        {icon ? <span className="form-panel-icon" aria-hidden>{icon}</span> : null}
        <span className="form-panel-title">{title}</span>
        {!open && hint ? <span className="form-panel-hint">{hint}</span> : null}
        <span className="form-panel-chevron" aria-hidden>{open ? '▾' : '▸'}</span>
      </button>
      {open ? (
        <div className="form-panel-body-wrap">
          <div className="form-panel-body">{children}</div>
        </div>
      ) : null}
    </section>
  );
}
