import Link from 'next/link';
import Image from 'next/image';

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
          <div className="footer-socials">
            <a href="#" target="_blank" rel="noopener noreferrer" className="footer-social" aria-label="Facebook">
              <svg viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg"><path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" /></svg>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="footer-social" aria-label="Twitter">
              <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" /></svg>
            </a>
          </div>
        </div>

        {/* Explore Column */}
        <div>
          <h6 className="footer-col-title">Explore</h6>
          <nav className="footer-nav">
            <Link href="/glossaryp">Glossary</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/admin">Admin Panel</Link>
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
