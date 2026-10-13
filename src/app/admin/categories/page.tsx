'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminAlert from '@/components/admin/AdminAlert';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { slugify } from '@/lib/admin/postForm';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  type Category,
} from '@/lib/api';

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await getCategories());
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
    setDescription('');
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const payload = { name: name.trim(), slug: slug.trim() || slugify(name), description };
    const res = editing
      ? await updateCategory(editing.id, payload)
      : await createCategory(payload);
    if (res.success) {
      setNotification({ type: 'success', message: editing ? 'Category updated.' : 'Category created.' });
      resetForm();
      await load();
    } else {
      setNotification({ type: 'error', message: res.message || 'Save failed.' });
    }
  };

  return (
    <div className="container">
      <AdminPageHeader
        title="Categories"
        actions={<Link href="/admin" className="btn btn-outline admin-btn-sm">← Posts</Link>}
      />
      {notification && <AdminAlert type={notification.type} message={notification.message} onDismiss={() => setNotification(null)} />}

      <div className="admin-card">
        <form onSubmit={handleSubmit} className="form-box">
          <h3 className="form-box-title">{editing ? 'Edit category' : 'New category'}</h3>
          <div className="form-field">
            <label>Name *</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Slug</label>
            <input className="form-input" value={slug} onChange={e => setSlug(e.target.value)} placeholder="auto-generated" />
          </div>
          <div className="form-field">
            <label>Description</label>
            <textarea className="form-textarea" rows={2} value={description} onChange={e => setDescription(e.target.value)} />
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
          <div className="admin-loading">Loading categories…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.slug}</td>
                  <td>{item.description}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="action-btn action-btn-edit"
                        onClick={() => {
                          setEditing(item);
                          setName(item.name);
                          setSlug(item.slug);
                          setDescription(item.description);
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
          title="Delete category?"
          description={`Delete "${toDelete.name}"? Posts will keep their legacy category label.`}
          confirmLabel="Delete"
          loadingLabel="Deleting…"
          isLoading={false}
          onConfirm={async () => {
            const res = await deleteCategory(toDelete.id);
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
