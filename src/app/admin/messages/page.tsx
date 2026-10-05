'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminAlert from '@/components/admin/AdminAlert';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { ContactMessage, deleteContactMessage, getContactMessages } from '@/lib/api';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMessage, setViewMessage] = useState<ContactMessage | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function loadMessages() {
      setLoading(true);
      try {
        setMessages(await getContactMessages());
      } catch (err) {
        console.error('Failed to load contact messages:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMessages();
  }, []);

  const filteredMessages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      m =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
    );
  }, [messages, searchQuery]);

  const handleDeleteConfirm = async () => {
    if (!messageToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteContactMessage(messageToDelete.id);
      if (res.success) {
        setNotification({ type: 'success', message: `Message from "${messageToDelete.name}" was deleted.` });
        setMessages(prev => prev.filter(m => m.id !== messageToDelete.id));
        if (viewMessage?.id === messageToDelete.id) setViewMessage(null);
        setMessageToDelete(null);
      } else {
        setNotification({ type: 'error', message: res.message || 'Failed to delete message.' });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error deleting message.';
      setNotification({ type: 'error', message });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setNotification(null), 5000);
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
          <div className="stat-icon">✉️</div>
          <div className="stat-info">
            <h4>Total Messages</h4>
            <div className="stat-number">{messages.length}</div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h1 className="admin-card-title">Contact Messages</h1>
            <p className="admin-card-subtitle">Messages submitted through the Contact Us form.</p>
          </div>
        </div>

        <div className="admin-filter-panel">
          <div className="admin-filter-bar">
            <input
              type="text"
              placeholder="Search by name, email, subject, or message..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
            <span className="admin-filter-count">
              Showing <strong>{filteredMessages.length}</strong> of {messages.length}
            </span>
          </div>
        </div>

        <div className="admin-table-wrapper">
          {loading ? (
            <div className="admin-loading">Loading messages...</div>
          ) : filteredMessages.length === 0 ? (
            <div className="admin-empty-state">
              <p className="admin-empty-title">No messages found</p>
              <p className="admin-empty-desc">
                {messages.length === 0
                  ? 'Contact form submissions will appear here.'
                  : 'Adjust your search to find messages.'}
              </p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map(msg => (
                  <tr key={msg.id}>
                    <td>{msg.name}</td>
                    <td>
                      <a href={`mailto:${msg.email}`} className="contact-email-link">
                        {msg.email}
                      </a>
                    </td>
                    <td>{msg.subject || '—'}</td>
                    <td>{formatDate(msg.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          onClick={() => setViewMessage(msg)}
                          className="action-btn action-btn-view"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => setMessageToDelete(msg)}
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

      {viewMessage && (
        <div className="modal-overlay" onClick={() => setViewMessage(null)}>
          <div className="modal-card contact-message-modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Message from {viewMessage.name}</h3>
            <div className="contact-message-meta">
              <p><strong>Email:</strong> <a href={`mailto:${viewMessage.email}`}>{viewMessage.email}</a></p>
              <p><strong>Subject:</strong> {viewMessage.subject || '—'}</p>
              <p><strong>Date:</strong> {formatDate(viewMessage.createdAt)}</p>
            </div>
            <div className="contact-message-body">{viewMessage.message}</div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline admin-btn-sm"
                onClick={() => setViewMessage(null)}
              >
                Close
              </button>
              <a href={`mailto:${viewMessage.email}`} className="btn btn-primary admin-btn-sm">
                Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}

      {messageToDelete && (
        <ConfirmModal
          title="Delete Message?"
          description={
            <>
              Permanently delete the message from <strong>&quot;{messageToDelete.name}&quot;</strong>? This cannot be undone.
            </>
          }
          confirmLabel="Delete Message"
          loadingLabel="Deleting..."
          isLoading={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setMessageToDelete(null)}
        />
      )}
    </div>
  );
}
