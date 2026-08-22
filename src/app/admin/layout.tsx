'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    // Skip auth check on the login page itself
    if (pathname === '/admin/login') {
      setAuthed(true);
      return;
    }
    const isAuthed = localStorage.getItem('pv_admin_auth') === 'true';
    if (!isAuthed) {
      router.replace('/admin/login');
    } else {
      setAuthed(true);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('pv_admin_auth');
    router.replace('/admin/login');
  };

  // On login page, render children directly (no admin shell)
  if (pathname === '/admin/login') return <>{children}</>;

  // Show nothing while checking auth
  if (!authed) return null;

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-logo-area">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', color: '#fff', fontWeight: 'bold' }}>
              Proxy<span style={{ color: 'var(--accent)' }}>View</span>
            </span>
          </Link>
          <span className="admin-badge">Admin Panel</span>
        </div>

        <nav className="admin-nav">
          <Link href="/admin" className="admin-nav-link">
            📊 All Posts
          </Link>
          <Link href="/admin/posts/new" className="admin-nav-link">
            ✍️ Add New Post
          </Link>
          <Link href="/blog" target="_blank" className="admin-nav-link">
            🌐 Live Blog ↗
          </Link>
          <Link href="/" className="admin-nav-link">
            🏠 Home
          </Link>
          <button
            onClick={handleLogout}
            className="admin-nav-link admin-logout-btn"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', color: '#fca5a5' }}
          >
            🔒 Logout
          </button>
        </nav>
      </header>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
