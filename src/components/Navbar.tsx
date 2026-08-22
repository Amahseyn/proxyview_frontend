'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import ProxyViewLogo from '@/components/ProxyViewLogo';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/glossaryp', label: 'Glossary' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about_us', label: 'About Us' },
  { href: '/contact_us', label: 'Contact Us' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setToolsOpen(false); }, [pathname]);

  return (
    <nav className="navbar" style={{ boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.05)' }}>
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo" aria-label="ProxyView Home">
          <ProxyViewLogo width={180} height={46} />
        </Link>
        <div className="navbar-menu">
          <Link href="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
          <Link href="/about_us" className={pathname === '/about_us' ? 'active' : ''}>About Us</Link>
          <Link href="/blog" className={pathname === '/blog' || pathname.startsWith('/blog/') ? 'active' : ''}>Blog</Link>
          <Link href="/glossaryp" className={pathname === '/glossaryp' ? 'active' : ''}>Glossary</Link>
          <Link href="/faq" className={pathname === '/faq' ? 'active' : ''}>FAQ</Link>
          <Link href="/contact_us" className={pathname === '/contact_us' ? 'active' : ''}>Contact Us</Link>
          
          {/* Tools Dropdown */}
          <div 
            className="navbar-dropdown-wrapper" 
            onMouseEnter={() => setToolsOpen(true)} 
            onMouseLeave={() => setToolsOpen(false)}
          >
            <button className="navbar-dropdown-btn" aria-expanded={toolsOpen}>
              Tools
              <svg className="dropdown-chevron" viewBox="0 0 320 512" width="12" height="12" fill="currentColor">
                <path d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"/>
              </svg>
            </button>
            {toolsOpen && (
              <div className="navbar-dropdown-menu">
                <Link href="/blog?category=research" className="dropdown-item">Research</Link>
                <Link href="/#reviews" className="dropdown-item">Rating</Link>
                <Link href="/#pricing" className="dropdown-item">Choose</Link>
              </div>
            )}
          </div>
        </div>

        <div className="navbar-cta" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link href="/contact_us" className="btn btn-primary btn-sm">Get Started</Link>
        </div>

        <button className="navbar-burger" aria-label="Toggle menu" onClick={() => setMobileOpen(o => !o)}>
          <span style={{ transform: mobileOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ opacity: mobileOpen ? 0 : 1 }} />
          <span style={{ transform: mobileOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </div>

      <div className={`navbar-mobile${mobileOpen ? ' open' : ''}`}>
        <Link href="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
        <Link href="/about_us" className={pathname === '/about_us' ? 'active' : ''}>About Us</Link>
        <Link href="/blog" className={pathname === '/blog' ? 'active' : ''}>Blog</Link>
        <Link href="/glossaryp" className={pathname === '/glossaryp' ? 'active' : ''}>Glossary</Link>
        <Link href="/faq" className={pathname === '/faq' ? 'active' : ''}>FAQ</Link>
        <Link href="/contact_us" className={pathname === '/contact_us' ? 'active' : ''}>Contact Us</Link>
        <div style={{ padding: '8px 0', borderTop: '1px solid rgba(0,49,53,0.1)' }}>
          <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '8px' }}>Tools:</div>
          <Link href="/blog?category=research" style={{ paddingLeft: '16px' }}>Research</Link>
          <Link href="/#reviews" style={{ paddingLeft: '16px' }}>Rating</Link>
          <Link href="/#pricing" style={{ paddingLeft: '16px' }}>Choose</Link>
        </div>
        <Link href="/contact_us" className="btn btn-primary" style={{ marginTop: '12px' }}>Get Started</Link>
      </div>
    </nav>
  );
}
