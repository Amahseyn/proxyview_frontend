'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import ProxyViewLogo from '@/components/ProxyViewLogo';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isIpCheckerActive = pathname === '/proxy-checker';

  return (
    <nav className="navbar" style={{ boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.05)' }}>
      <div className="navbar-inner">
        <div className="navbar-start">
          <Link href="/" className="navbar-logo" aria-label="ProxyView Home">
            <ProxyViewLogo width={180} height={46} />
          </Link>
        </div>

        <div className="navbar-menu">
          <Link href="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
          <Link href="/about_us" className={pathname === '/about_us' ? 'active' : ''}>About Us</Link>
          <Link href="/blog" className={pathname === '/blog' || pathname.startsWith('/blog/') ? 'active' : ''}>Blog</Link>
          <Link href="/glossary" className={pathname === '/glossary' ? 'active' : ''}>Glossary</Link>
          <Link href="/faq" className={pathname === '/faq' ? 'active' : ''}>FAQ</Link>
          <Link href="/proxy-checker" className={isIpCheckerActive ? 'active' : ''}>IP Checker</Link>
          <Link href="/contact_us" className={pathname === '/contact_us' ? 'active' : ''}>Contact Us</Link>
        </div>

        <div className="navbar-end">
          <button className="navbar-burger" aria-label="Toggle menu" onClick={() => setMobileOpen(o => !o)}>
            <span style={{ transform: mobileOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <span style={{ opacity: mobileOpen ? 0 : 1 }} />
            <span style={{ transform: mobileOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        </div>
      </div>

      <div className={`navbar-mobile${mobileOpen ? ' open' : ''}`}>
        <Link href="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
        <Link href="/about_us" className={pathname === '/about_us' ? 'active' : ''}>About Us</Link>
        <Link href="/blog" className={pathname === '/blog' ? 'active' : ''}>Blog</Link>
        <Link href="/glossary" className={pathname === '/glossary' ? 'active' : ''}>Glossary</Link>
        <Link href="/faq" className={pathname === '/faq' ? 'active' : ''}>FAQ</Link>
        <Link href="/proxy-checker" className={isIpCheckerActive ? 'active' : ''}>IP Checker</Link>
        <Link href="/contact_us" className={pathname === '/contact_us' ? 'active' : ''}>Contact Us</Link>
      </div>
    </nav>
  );
}
