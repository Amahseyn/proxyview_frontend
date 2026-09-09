'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAdminAuthed, setAdminAuthed, validateAdminCredentials } from '@/lib/admin/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminAuthed()) {
      router.replace('/admin');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 400));

    if (validateAdminCredentials(username, password)) {
      setAdminAuthed();
      router.replace('/admin');
      return;
    }

    setError('Invalid username or password.');
    setLoading(false);
  };

  return (
    <div className="admin-login-root">
      <div className="admin-login-blob blob-1" />
      <div className="admin-login-blob blob-2" />

      <div className="admin-login-card">
        <div className="admin-login-logo">
          <div className="admin-login-brand">
            Proxy<span className="brand-accent">View</span>
            <span className="admin-login-badge">Admin</span>
          </div>
        </div>

        <h1 className="admin-login-title">Welcome back</h1>
        <p className="admin-login-subtitle">Sign in to access the admin panel</p>

        <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
          {error && (
            <div className="admin-login-error" role="alert">{error}</div>
          )}

          <div className="admin-login-field">
            <label htmlFor="admin-username">Username</label>
            <div className="admin-input-wrapper">
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="admin-login-field">
            <label htmlFor="admin-password">Password</label>
            <div className="admin-input-wrapper">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="admin-input-toggle"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="admin-login-spinner" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="admin-login-footer">
          Not an admin? <Link href="/">Go to homepage</Link>
        </p>
      </div>
    </div>
  );
}
