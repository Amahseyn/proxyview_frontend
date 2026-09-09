'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { clearAdminAuth, isAdminAuthed } from '@/lib/admin/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setAuthed(true);
      return;
    }
    if (!isAdminAuthed()) {
      router.replace('/admin/login');
      return;
    }
    setAuthed(true);
  }, [isLoginPage, pathname, router]);

  const handleLogout = () => {
    clearAdminAuth();
    router.replace('/admin/login');
  };

  if (isLoginPage) return <>{children}</>;
  if (!authed) return null;

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-logo-area">
          <Link href="/" className="admin-brand-link">
            <span className="admin-brand-text">
              Proxy<span className="admin-brand-accent">View</span>
            </span>
          </Link>
          <span className="admin-badge">Admin</span>
        </div>

        <nav className="admin-nav">
          <Link href="/admin" className="admin-nav-link">All Posts</Link>
          <Link href="/admin/posts/new" className="admin-nav-link">Add Post</Link>
          <Link href="/blog" target="_blank" className="admin-nav-link">Live Blog ↗</Link>
          <Link href="/" className="admin-nav-link">Home</Link>
          <button type="button" onClick={handleLogout} className="admin-nav-link admin-logout-btn">
            Logout
          </button>
        </nav>
      </header>

      <main className="admin-main">{children}</main>
    </div>
  );
}
