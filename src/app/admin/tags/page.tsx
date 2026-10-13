'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminAlert from '@/components/admin/AdminAlert';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { slugify } from '@/lib/admin/postForm';
import { createTag, deleteTag, getTags, updateTag, type Tag } from '@/lib/api';

export default function AdminTagsPage() {
  const [items, setItems] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [editing, setEditing] = useState<Tag | null>(null);
  const [toDelete, setToDelete] = useState<Tag | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await getTags());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setName('');
    setSlug('');
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const payload = { name: name.trim(), slug: slug.trim() || slugify(name) };
    const res = editing ? await updateTag(editing.id, payload) : await createTag(payload);
    if (res.success) {
      setNotification({ type: 'success', message: editing ? 'Tag updated.' : 'Tag created.' });
      resetForm();
      await load();
    } else {
      setNotification({ type: 'error', message: res.message || 'Save failed.' });
    }
  };

  return (
    <div className="container">
      <AdminPageHeader
        title="Tags"
        actions={<Link href="/admin" className="btn btn-outline admin-btn-sm">← Posts</Link>}
      />
      {notification && <AdminAlert type={notification.type} message={notification.message} onDismiss={() => setNotification(null)} />}

      <div className="admin-card">
        <form onSubmit={handleSubmit} className="form-box">
          <h3 className="form-box-title">{editing ? 'Edit tag' : 'New tag'}</h3>
          <div className="form-field">
            <label>Name *</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Slug</label>
            <input className="form-input" value={slug} onChange={e => setSlug(e.target.value)} placeholder="auto-generated" />
          </div>
          <div className="action-buttons">
            <button type="submit" className="btn btn-primary admin-btn-sm">{editing ? 'Update' : 'Create'}</button>
            {editing && (
              <button type="button" className="btn btn-outline admin-btn-sm" onClick={resetForm}>Cancel edit</button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-card admin-table-wrapper">
        {loading ? (
          <div className="admin-loading">Loading tags…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.slug}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="action-btn action-btn-edit"
                        onClick={() => {
                          setEditing(item);
                          setName(item.name);
                          setSlug(item.slug);
                        }}
                      >
                        Edit
                      </button>
                      <button type="button" className="action-btn action-btn-delete" onClick={() => setToDelete(item)}>
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

      {toDelete && (
        <ConfirmModal
          title="Delete tag?"
          description={`Delete "${toDelete.name}"?`}
          confirmLabel="Delete"
          loadingLabel="Deleting…"
          isLoading={false}
          onConfirm={async () => {
            const res = await deleteTag(toDelete.id);
            if (res.success) {
              setToDelete(null);
              await load();
            }
          }}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
