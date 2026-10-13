'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { clearAdminAuth, isAdminAuthed } from '@/lib/admin/auth';

export default function AdminShell({ children }: { children: React.ReactNode }) {
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

  const isPostsSection =
    pathname === '/admin' || pathname.startsWith('/admin/posts');

  const navClass = (active: boolean) => `admin-nav-link${active ? ' active' : ''}`;

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

        <nav className="admin-nav" aria-label="Admin">
          <div className="admin-nav-group">
            <Link href="/admin" className={navClass(isPostsSection)}>Posts</Link>
            <Link href="/admin/categories" className={navClass(pathname.startsWith('/admin/categories'))}>
              Categories
            </Link>
            <Link href="/admin/tags" className={navClass(pathname.startsWith('/admin/tags'))}>
              Tags
            </Link>
            <Link href="/admin/glossary" className={navClass(pathname.startsWith('/admin/glossary'))}>
              Glossary
            </Link>
            <Link href="/admin/messages" className={navClass(pathname.startsWith('/admin/messages'))}>
              Messages
            </Link>
          </div>
          <div className="admin-nav-divider" aria-hidden="true" />
          <div className="admin-nav-group">
            <Link href="/admin/posts/new" className={navClass(pathname === '/admin/posts/new')}>
              New post
            </Link>
            <Link href="/blog" target="_blank" rel="noopener noreferrer" className="admin-nav-link">
              View blog
            </Link>
            <Link href="/" className="admin-nav-link">Site</Link>
          </div>
          <button type="button" onClick={handleLogout} className="admin-nav-link admin-logout-btn">
            Logout
          </button>
        </nav>
      </header>

      <main className="admin-main">{children}</main>
    </div>
  );
}
