'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'proxyview2025';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('pv_admin_auth') === 'true') {
      router.replace('/admin');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem('pv_admin_auth', 'true');
      router.replace('/admin');
    } else {
      setError('Invalid username or password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-root">
      <div className="admin-login-blob blob-1" />
      <div className="admin-login-blob blob-2" />

      <div className="admin-login-card">
        <div className="admin-login-logo">
          <svg width="48" height="48" viewBox="0 0 134 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M31.7148 33.939C32.4858 32.4065 33.212 30.8615 33.8285 29.2586C30.2719 33.0492 25.9172 35.0708 20.7185 35.0738C15.5198 35.0768 11.1625 33.0562 7.6236 29.2546L7.55918 29.2878C7.90089 30.0613 8.22952 30.8414 8.58734 31.6073C8.94969 32.3844 9.33972 33.1483 9.74484 33.9767C9.41319 33.7507 9.11274 33.5686 8.83897 33.3532C8.24378 32.8868 7.65664 32.4099 7.07755 31.9224C6.94603 31.8127 6.8405 31.6752 6.76855 31.5198C5.4178 28.4876 4.3529 25.3649 3.76358 22.0886C3.55321 20.9216 3.29705 19.7636 3.24269 18.5739C3.09171 15.2523 3.79226 12.123 5.40119 9.20864C7.02723 6.26455 9.32664 3.98377 12.2662 2.35923C14.2908 1.24098 16.4624 0.572655 18.7628 0.311965C20.8972 0.0709027 23.0078 0.205275 25.0783 0.753328C29.4979 1.92392 32.9704 4.42714 35.459 8.27156C36.7534 10.2705 37.5728 12.4587 37.9643 14.8034C38.2632 16.594 38.2924 18.3942 38.0035 20.1883C37.4887 23.3855 36.7257 26.5179 35.4872 29.5213C35.2255 30.1559 34.9618 30.7895 34.6875 31.4186C34.6267 31.5509 34.5413 31.6705 34.4359 31.7709C33.6725 32.5199 32.8348 33.1892 31.9357 33.7683C31.8592 33.8217 31.7887 33.8831 31.7148 33.939Z" fill="#003135"/>
          </svg>
          <div className="admin-login-brand">
            Proxy<span className="brand-accent">View</span>
            <span className="admin-login-badge">Admin</span>
          </div>
        </div>

        <h1 className="admin-login-title">Welcome back</h1>
        <p className="admin-login-subtitle">Sign in to access the admin panel</p>

        <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
          {error && (
            <div className="admin-login-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div className="admin-login-field">
            <label htmlFor="admin-username">Username</label>
            <div className="admin-input-wrapper">
              <svg className="admin-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
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
              <svg className="admin-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
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
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
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
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Sign In
              </>
            )}
          </button>
        </form>

        <p className="admin-login-footer">
          Not an admin?{' '}
          <a href="/">Go to homepage</a>
        </p>
      </div>

      <style>{`
        .admin-login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f4f0da;
          position: relative;
          overflow: hidden;
          font-family: 'Poppins', 'Inter', sans-serif;
        }
        .admin-login-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          pointer-events: none;
        }
        .blob-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #003135 0%, transparent 70%);
          top: -150px; left: -150px;
        }
        .blob-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #ffd54a 0%, transparent 70%);
          bottom: -100px; right: -100px;
        }
        .admin-login-card {
          background: #fff;
          border-radius: 24px;
          padding: 48px 44px 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 24px 64px rgba(0,49,53,0.14), 0 4px 16px rgba(0,49,53,0.06);
          position: relative;
          z-index: 1;
        }
        .admin-login-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
        }
        .admin-login-brand {
          font-size: 22px;
          font-weight: 700;
          color: #003135;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .brand-accent { color: #f5a623; }
        .admin-login-badge {
          font-size: 10px;
          font-weight: 700;
          background: #003135;
          color: #ffd54a;
          padding: 3px 9px;
          border-radius: 20px;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          margin-left: 2px;
        }
        .admin-login-title {
          font-size: 26px;
          font-weight: 700;
          color: #003135;
          margin: 0 0 6px;
          line-height: 1.2;
        }
        .admin-login-subtitle {
          font-size: 14px;
          color: #7a8a8b;
          margin: 0 0 28px;
        }
        .admin-login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .admin-login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff5f5;
          border: 1px solid #fca5a5;
          color: #dc2626;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 14px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .admin-login-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .admin-login-field label {
          font-size: 13px;
          font-weight: 600;
          color: #003135;
          letter-spacing: 0.2px;
        }
        .admin-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .admin-input-icon {
          position: absolute;
          left: 14px;
          color: #a0b4b6;
          pointer-events: none;
          z-index: 1;
        }
        .admin-input-wrapper input {
          width: 100%;
          padding: 13px 48px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          font-family: inherit;
          color: #003135;
          background: #f8fafc;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          outline: none;
          box-sizing: border-box;
        }
        .admin-input-wrapper input:focus {
          border-color: #003135;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(0,49,53,0.09);
        }
        .admin-input-toggle {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          cursor: pointer;
          color: #a0b4b6;
          padding: 0;
          display: flex;
          align-items: center;
          transition: color 0.2s;
          z-index: 1;
        }
        .admin-input-toggle:hover { color: #003135; }
        .admin-login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          background: #003135;
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 15px;
          font-size: 15px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(0,49,53,0.22);
          margin-top: 4px;
        }
        .admin-login-btn:hover:not(:disabled) {
          background: #00494e;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0,49,53,0.28);
        }
        .admin-login-btn:active:not(:disabled) { transform: translateY(0); }
        .admin-login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .admin-login-spinner {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .admin-login-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: #7a8a8b;
        }
        .admin-login-footer a {
          color: #003135;
          font-weight: 600;
          text-decoration: none;
        }
        .admin-login-footer a:hover { text-decoration: underline; }
        @media (max-width: 480px) {
          .admin-login-card { padding: 36px 24px 32px; margin: 16px; border-radius: 18px; }
          .admin-login-title { font-size: 22px; }
        }
      `}</style>
    </div>
  );
}
