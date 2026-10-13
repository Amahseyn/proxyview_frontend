'use client';

import {
  anchorFromLabel,
  createPostTocItem,
  extractTocFromHtml,
  extractTocFromLegacyMarkdown,
  parsePostToc,
  serializePostToc,
  type PostTocDocument,
  type PostTocHeadingLevel,
} from '@/lib/postToc';

type PostTocEditorProps = {
  tocJson: string;
  contentHtml: string;
  onChange: (tocJson: string) => void;
};

export default function PostTocEditor({ tocJson, contentHtml, onChange }: PostTocEditorProps) {
  const doc = parsePostToc(tocJson);

  const commit = (next: PostTocDocument) => {
    onChange(serializePostToc(next));
  };

  const updateItem = (
    id: string,
    patch: Partial<{ label: string; anchor: string; level: PostTocHeadingLevel }>,
  ) => {
    commit({
      ...doc,
      items: doc.items.map(item => {
        if (item.id !== id) return item;
        const next = { ...item, ...patch };
        if (patch.label !== undefined && patch.anchor === undefined) {
          next.anchor = anchorFromLabel(patch.label);
        }
        return next;
      }),
    });
  };

  const generateFromContent = () => {
    const isHtml = /<[a-z][\s\S]*>/i.test(contentHtml);
    const items = isHtml
      ? extractTocFromHtml(contentHtml)
      : extractTocFromLegacyMarkdown(contentHtml);
    commit({ ...doc, items });
  };

  return (
    <div className="post-toc-editor">
      <div className="post-toc-editor-actions">
        <button type="button" className="btn btn-outline btn-sm" onClick={generateFromContent}>
          Generate from headings
        </button>
        <p className="form-help">Pulls H2 and H3 from the post body. You can edit labels and anchors below.</p>
      </div>

      <div className="form-field">
        <label htmlFor="post-toc-section-title">Section title (H2)</label>
        <input
          id="post-toc-section-title"
          type="text"
          className="form-input"
          placeholder="Table of contents"
          value={doc.sectionTitle}
          onChange={e => commit({ ...doc, sectionTitle: e.target.value })}
        />
      </div>

      {doc.items.length === 0 ? (
        <p className="form-help">No entries yet. Generate from headings or add one manually.</p>
      ) : (
        <ul className="post-toc-editor-list">
          {doc.items.map((item, index) => (
            <li key={item.id} className="post-toc-editor-item">
              <div className="post-toc-editor-item-head">
                <span className="post-toc-editor-index">{index + 1}</span>
                <button
                  type="button"
                  className="block-row-action block-row-action--danger"
                  onClick={() => commit({ ...doc, items: doc.items.filter(row => row.id !== item.id) })}
                >
                  Remove
                </button>
              </div>
              <div className="form-field">
                <label>Label</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Section heading text"
                  value={item.label}
                  onChange={e => updateItem(item.id, { label: e.target.value })}
                />
              </div>
              <div className="post-toc-editor-row">
                <div className="form-field">
                  <label>Anchor ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="url-friendly-id"
                    value={item.anchor}
                    onChange={e => updateItem(item.id, { anchor: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Level</label>
                  <select
                    className="form-select-full"
                    value={item.level}
                    onChange={e =>
                      updateItem(item.id, { level: e.target.value === '3' ? 3 : 2 })
                    }
                  >
                    <option value={2}>H2</option>
                    <option value={3}>H3</option>
                  </select>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="btn btn-outline btn-sm"
        onClick={() => commit({ ...doc, items: [...doc.items, createPostTocItem()] })}
      >
        + Add entry
      </button>
    </div>
  );
}
