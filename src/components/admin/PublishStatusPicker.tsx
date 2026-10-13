'use client';

import type { PublishOption } from '@/lib/admin/postForm';

const OPTIONS: { value: PublishOption; label: string; desc: string; tone: string }[] = [
  { value: 'draft', label: 'Draft', desc: 'Only visible in admin', tone: 'draft' },
  { value: 'publish', label: 'Published', desc: 'Live on the blog', tone: 'publish' },
  { value: 'schedule', label: 'Scheduled', desc: 'Publish later', tone: 'schedule' },
  { value: 'archive', label: 'Archived', desc: 'Hidden archive', tone: 'archive' },
];

type PublishStatusPickerProps = {
  value: PublishOption;
  onChange: (value: PublishOption) => void;
};

export default function PublishStatusPicker({ value, onChange }: PublishStatusPickerProps) {
  return (
    <div className="publish-status-picker" role="radiogroup" aria-label="Post status">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          className={`publish-status-option publish-status-option--${opt.tone} ${value === opt.value ? 'is-active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          <span className="publish-status-option-label">{opt.label}</span>
          <span className="publish-status-option-desc">{opt.desc}</span>
        </button>
      ))}
    </div>
  );
}
