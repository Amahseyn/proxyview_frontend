'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AdminAlert from '@/components/admin/AdminAlert';
import ConfirmModal from '@/components/admin/ConfirmModal';
import {
  createGlossaryTerm,
  deleteGlossaryTerm,
  getGlossaryContent,
  GlossaryPageConfig,
  GlossaryTerm,
  updateGlossaryPageConfig,
  updateGlossaryTerm,
} from '@/lib/api';

type TermFormState = {
  term: string;
  definition: string;
  sortOrder: string;
};

const emptyTermForm: TermFormState = {
  term: '',
  definition: '',
  sortOrder: '',
};

export default function AdminGlossaryPage() {
  const [config, setConfig] = useState<GlossaryPageConfig | null>(null);
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [termForm, setTermForm] = useState<TermFormState>(emptyTermForm);
  const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null);
  const [isSavingTerm, setIsSavingTerm] = useState(false);
  const [termToDelete, setTermToDelete] = useState<GlossaryTerm | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function loadGlossary() {
      setLoading(true);
      try {
        const content = await getGlossaryContent();
        setConfig(content.config);
        setTerms(content.terms);
        setHeroTitle(content.config.heroTitle);
        setHeroSubtitle(content.config.heroSubtitle);
      } catch (err) {
        console.error('Failed to load glossary content:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGlossary();
  }, []);

  const filteredTerms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return terms;
    return terms.filter(
      item => item.term.toLowerCase().includes(q) || item.definition.toLowerCase().includes(q)
    );
  }, [terms, searchQuery]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSaveConfig = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingConfig(true);
    try {
      const res = await updateGlossaryPageConfig({ heroTitle, heroSubtitle });
      if (res.success && res.data) {
        setConfig(res.data);
        showNotification('success', 'Glossary page header updated.');
      } else {
        showNotification('error', res.message || 'Failed to update glossary page header.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error updating glossary page header.';
      showNotification('error', message);
    } finally {
      setSavingConfig(false);
    }
  };

  const openCreateForm = () => {
    setEditingTerm(null);
    setTermForm(emptyTermForm);
  };

  const openEditForm = (item: GlossaryTerm) => {
    setEditingTerm(item);
    setTermForm({
      term: item.term,
      definition: item.definition,
      sortOrder: String(item.sortOrder),
    });
  };

  const handleSaveTerm = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSavingTerm(true);

    const payload = {
      term: termForm.term.trim(),
      definition: termForm.definition.trim(),
      sortOrder: termForm.sortOrder.trim() ? Number(termForm.sortOrder) : undefined,
    };

    try {
      const res = editingTerm
        ? await updateGlossaryTerm(editingTerm.id, payload)
        : await createGlossaryTerm(payload);

      if (res.success && res.data) {
        if (editingTerm) {
          setTerms(prev => prev.map(item => (item.id === res.data!.id ? res.data! : item)));
          showNotification('success', `Updated "${res.data.term}".`);
        } else {
          setTerms(prev => [...prev, res.data!].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id));
          showNotification('success', `Added "${res.data.term}".`);
        }
        setEditingTerm(null);
        setTermForm(emptyTermForm);
      } else {
        showNotification('error', res.message || 'Failed to save glossary term.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error saving glossary term.';
      showNotification('error', message);
    } finally {
      setIsSavingTerm(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!termToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteGlossaryTerm(termToDelete.id);
      if (res.success) {
        setTerms(prev => prev.filter(item => item.id !== termToDelete.id));
        if (editingTerm?.id === termToDelete.id) {
          setEditingTerm(null);
          setTermForm(emptyTermForm);
        }
        showNotification('success', `Deleted "${termToDelete.term}".`);
        setTermToDelete(null);
      } else {
        showNotification('error', res.message || 'Failed to delete glossary term.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error deleting glossary term.';
      showNotification('error', message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container">
      {notification && (
        <AdminAlert
          type={notification.type}
          message={notification.message}
          onDismiss={() => setNotification(null)}
        />
      )}

      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-info">
            <h4>Glossary Terms</h4>
            <div className="stat-number">{terms.length}</div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h1 className="admin-card-title">Glossary Page</h1>
            <p className="admin-card-subtitle">Manage the public glossary header and term definitions.</p>
          </div>
          <Link href="/glossary" target="_blank" className="btn btn-outline admin-btn-sm">
            View Live Page ↗
          </Link>
        </div>

        <form onSubmit={handleSaveConfig} className="admin-form-section">
          <h2 className="admin-section-title">Page Header</h2>
          <div className="admin-form-grid">
            <label className="admin-form-field">
              <span>Hero Title</span>
              <input
                type="text"
                value={heroTitle}
                onChange={e => setHeroTitle(e.target.value)}
                className="admin-input"
                required
              />
            </label>
            <label className="admin-form-field admin-form-field-full">
              <span>Hero Subtitle</span>
              <textarea
                value={heroSubtitle}
                onChange={e => setHeroSubtitle(e.target.value)}
                className="admin-textarea"
                rows={3}
                required
              />
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary admin-btn-sm" disabled={savingConfig}>
              {savingConfig ? 'Saving...' : 'Save Header'}
            </button>
            {config && (
              <span className="admin-meta-text">
                Last updated {new Date(config.updatedAt).toLocaleString()}
              </span>
            )}
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Terms</h2>
            <p className="admin-card-subtitle">Add, edit, or remove glossary entries.</p>
          </div>
          <button type="button" className="btn btn-primary admin-btn-sm" onClick={openCreateForm}>
            Add Term
          </button>
        </div>

        <form onSubmit={handleSaveTerm} className="admin-form-section">
          <h3 className="admin-section-title">{editingTerm ? `Edit "${editingTerm.term}"` : 'New Term'}</h3>
          <div className="admin-form-grid">
            <label className="admin-form-field">
              <span>Term</span>
              <input
                type="text"
                value={termForm.term}
                onChange={e => setTermForm(prev => ({ ...prev, term: e.target.value }))}
                className="admin-input"
                required
              />
            </label>
            <label className="admin-form-field">
              <span>Sort Order</span>
              <input
                type="number"
                value={termForm.sortOrder}
                onChange={e => setTermForm(prev => ({ ...prev, sortOrder: e.target.value }))}
                className="admin-input"
                placeholder="Auto"
              />
            </label>
            <label className="admin-form-field admin-form-field-full">
              <span>Definition</span>
              <textarea
                value={termForm.definition}
                onChange={e => setTermForm(prev => ({ ...prev, definition: e.target.value }))}
                className="admin-textarea"
                rows={4}
                required
              />
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary admin-btn-sm" disabled={isSavingTerm}>
              {isSavingTerm ? 'Saving...' : editingTerm ? 'Update Term' : 'Create Term'}
            </button>
            {(editingTerm || termForm.term || termForm.definition) && (
              <button
                type="button"
                className="btn btn-outline admin-btn-sm"
                onClick={() => {
                  setEditingTerm(null);
                  setTermForm(emptyTermForm);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="admin-filter-panel">
          <div className="admin-filter-bar">
            <input
              type="text"
              placeholder="Search terms or definitions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
            <span className="admin-filter-count">
              Showing <strong>{filteredTerms.length}</strong> of {terms.length}
            </span>
          </div>
        </div>

        <div className="admin-table-wrapper">
          {loading ? (
            <div className="admin-loading">Loading glossary terms...</div>
          ) : filteredTerms.length === 0 ? (
            <div className="admin-empty-state">
              <p className="admin-empty-title">No terms found</p>
              <p className="admin-empty-desc">
                {terms.length === 0 ? 'Add your first glossary term above.' : 'Adjust your search to find terms.'}
              </p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Term</th>
                  <th>Definition</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTerms.map(item => (
                  <tr key={item.id}>
                    <td>{item.sortOrder}</td>
                    <td>{item.term}</td>
                    <td>{item.definition}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          onClick={() => openEditForm(item)}
                          className="action-btn action-btn-view"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setTermToDelete(item)}
                          className="action-btn action-btn-delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {termToDelete && (
        <ConfirmModal
          title="Delete Term?"
          description={
            <>
              Permanently delete <strong>&quot;{termToDelete.term}&quot;</strong>? This cannot be undone.
            </>
          }
          confirmLabel="Delete Term"
          loadingLabel="Deleting..."
          isLoading={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setTermToDelete(null)}
        />
      )}
    </div>
  );
}
