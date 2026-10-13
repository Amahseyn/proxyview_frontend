'use client';

import {
  createPostFaqItem,
  parsePostFaq,
  serializePostFaq,
  type PostFaqDocument,
} from '@/lib/postFaq';

type PostFaqEditorProps = {
  faqJson: string;
  onChange: (faqJson: string) => void;
};

export default function PostFaqEditor({ faqJson, onChange }: PostFaqEditorProps) {
  const doc = parsePostFaq(faqJson);

  const commit = (next: PostFaqDocument) => {
    onChange(serializePostFaq(next));
  };

  const updateItem = (id: string, patch: Partial<{ question: string; answer: string }>) => {
    commit({
      ...doc,
      items: doc.items.map(item => (item.id === id ? { ...item, ...patch } : item)),
    });
  };

  return (
    <div className="post-faq-editor">
      <div className="form-field">
        <label htmlFor="post-faq-section-title">Section title (H2)</label>
        <input
          id="post-faq-section-title"
          type="text"
          className="form-input"
          placeholder="FAQ"
          value={doc.sectionTitle}
          onChange={e => commit({ ...doc, sectionTitle: e.target.value })}
        />
      </div>

      {doc.items.length === 0 ? (
        <p className="form-help">No questions yet. Add one below — answers are plain text (no HTML).</p>
      ) : (
        <ul className="post-faq-editor-list">
          {doc.items.map((item, index) => (
            <li key={item.id} className="post-faq-editor-item">
              <div className="post-faq-editor-item-head">
                <span className="post-faq-editor-index">Q{index + 1}</span>
                <button
                  type="button"
                  className="block-row-action block-row-action--danger"
                  onClick={() => commit({ ...doc, items: doc.items.filter(row => row.id !== item.id) })}
                >
                  Remove
                </button>
              </div>
              <div className="form-field">
                <label>Question (H3)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="What is…?"
                  value={item.question}
                  onChange={e => updateItem(item.id, { question: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>Answer (plain text)</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="Short, clear answer…"
                  value={item.answer}
                  onChange={e => updateItem(item.id, { answer: e.target.value })}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="btn btn-outline btn-sm"
        onClick={() => commit({ ...doc, items: [...doc.items, createPostFaqItem()] })}
      >
        + Add question
      </button>
    </div>
  );
}
