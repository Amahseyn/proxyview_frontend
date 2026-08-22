import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-content">
          <h1 className="hero-title">
            Find the Best Proxy Providers for Your Use Case
          </h1>
          <p className="hero-subtitle">
            We run unbiased, hands-on tests across leading proxy and anti-detect solutions.
            Whether you're scraping data, managing multiple accounts, or verifying ads,
            we break down performance, detectability, and compatibility by real-world use case.
          </p>
          <div className="hero-actions">
            <Link href="/contact_us" className="btn btn-primary">Contact Us</Link>
            <Link href="/blog" className="btn btn-accent">Read Reviews</Link>
          </div>
        </div>
        <div className="hero-image">
          <Image
            src="/images/Untitled-design-36.png"
            alt="ProxyView — Proxy Provider Reviews"
            width={560}
            height={560}
            priority
          />
        </div>
      </div>
    </section>
  );
}
