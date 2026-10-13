'use client';

type ChipOption = { id: number; name: string };

type TaxonomyChipPickerProps = {
  label: string;
  options: ChipOption[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  emptyHint?: string;
};

export default function TaxonomyChipPicker({
  label,
  options,
  selectedIds,
  onChange,
  emptyHint = 'None selected',
}: TaxonomyChipPickerProps) {
  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(x => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="taxonomy-chip-picker">
      <span className="taxonomy-chip-picker-label">{label}</span>
      {options.length === 0 ? (
        <p className="form-help">{emptyHint}</p>
      ) : (
        <div className="taxonomy-chip-list">
          {options.map(opt => {
            const active = selectedIds.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                className={`taxonomy-chip ${active ? 'is-selected' : ''}`}
                onClick={() => toggle(opt.id)}
                aria-pressed={active}
              >
                {active && <span className="taxonomy-chip-check">✓</span>}
                {opt.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
