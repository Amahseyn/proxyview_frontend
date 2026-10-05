import Link from 'next/link';
import Image from 'next/image';
import { SITE_EMAIL } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top container--wide" style={{ maxWidth: 'var(--max-width-footer)', margin: '0 auto', padding: '70px 70px', display: 'grid', gridTemplateColumns: '35% 17% 18% 18%', gap: '40px', borderBottom: '1px solid rgba(255,227,0,0.2)' }}>
        {/* Brand Column */}
        <div className="footer-brand" style={{ borderRight: '1px solid rgba(255,227,0,0.4)', paddingRight: '40px' }}>
          <div className="footer-logo" style={{ marginBottom: '20px' }}>
            <Image src="/images/PROXYVIEW_LOGO.png" alt="ProxyView" width={242} height={90} style={{ width: '242px', height: 'auto' }} />
          </div>
          <p className="footer-desc">
            We run unbiased, hands-on tests across leading proxy and anti-detect solutions. Whether you're scraping data, managing multiple accounts, or verifying ads, we break down performance, detectability, and compatibility by real-world use case.
          </p>
          <p className="footer-email">
            <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>
          </p>
        </div>

        {/* Explore Column */}
        <div>
          <h6 className="footer-col-title">Explore</h6>
          <nav className="footer-nav">
            <Link href="/proxy-checker">IP Checker</Link>
            <Link href="/glossary">Glossary</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/contact_us">Contact Us</Link>
            <Link href="/about_us">About Us</Link>
          </nav>
        </div>

        {/* Categories Column */}
        <div>
          <h6 className="footer-col-title">Categories</h6>
          <nav className="footer-nav">
            <Link href="/blog?category=guides">Guides</Link>
            <Link href="/blog?category=comparisons">Comparisons</Link>
            <Link href="/blog?category=research">Research</Link>
            <Link href="/blog?category=reviews">Reviews</Link>
          </nav>
        </div>

        {/* Legal Column */}
        <div>
          <h6 className="footer-col-title">Legal</h6>
          <div className="footer-legal-links">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms_conditions">Terms and Conditions</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} ProxyView. All rights reserved.</span>
        <span>Independent Proxy Reviews &amp; Comparisons</span>
      </div>
    </footer>
  );
}
