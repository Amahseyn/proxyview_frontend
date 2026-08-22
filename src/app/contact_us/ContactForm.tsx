'use client';
import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setMsg(data.message);
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
        setMsg(data.message || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMsg('Could not connect to server. Please try again.');
    }
  };

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Have a question, partnership inquiry, or feedback? We&#39;d love to hear from you.</p>
        </div>
      </div>
      <section className="contact-page section">
        <div className="contact-inner">
          {/* Left: Info */}
          <div className="contact-info">
            <h2>Get In Touch</h2>
            <p>
              Whether you&#39;re a proxy provider looking to be reviewed, a researcher with a question,
              or a reader wanting clarification — our team is happy to help.
            </p>
            <div className="contact-detail">
              <div className="contact-detail-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#FFE300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div className="contact-detail-text">
                <h4>Email</h4>
                <p>hello@proxyview.net</p>
              </div>
            </div>
            <div className="contact-detail">
              <div className="contact-detail-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#FFE300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <div className="contact-detail-text">
                <h4>Website</h4>
                <p>proxyview.net</p>
              </div>
            </div>
            <div className="contact-detail">
              <div className="contact-detail-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#FFE300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div className="contact-detail-text">
                <h4>Response Time</h4>
                <p>We typically respond within 1–2 business days.</p>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="contact-form-card">
            <h3>Send Us a Message</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="contact-name">Your Name</label>
                <input id="contact-name" type="text" placeholder="John Smith" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label htmlFor="contact-email">Email Address</label>
                <input id="contact-email" type="email" placeholder="john@example.com" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label htmlFor="contact-subject">Subject</label>
                <input id="contact-subject" type="text" placeholder="Partnership / Question / Review request" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
              </div>
              <div className="form-group">
                <label htmlFor="contact-message">Message</label>
                <textarea id="contact-message" placeholder="Tell us what's on your mind..." required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
              </div>
              <button type="submit" className="btn btn-primary form-submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'Sending…' : 'Send Message'}
              </button>
              {status === 'success' && <div className="form-success">✓ {msg}</div>}
              {status === 'error' && <div className="form-error">✕ {msg}</div>}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
