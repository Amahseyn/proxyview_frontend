'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FAQ_ITEMS } from '@/lib/data/faqs';
import { SITE_EMAIL } from '@/lib/site';

export default function FaqList() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about proxies, anti-detect tools, and ProxyView.</p>
        </div>
      </div>
      <section className="faq-page section">
        <div className="container">
          <div className="faq-inner">
            <p className="faq-intro">
              Can&#39;t find what you&#39;re looking for? Email us at{' '}
              <a href={`mailto:${SITE_EMAIL}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>{SITE_EMAIL}</a>{' '}
              or{' '}
              <Link href="/contact_us" style={{ color: 'var(--primary)', fontWeight: 600 }}>use our contact form</Link>.
            </p>
            <div className="accordion">
              {FAQ_ITEMS.map((faq, i) => (
                <div key={i} className="accordion-item">
                  <h3 className="accordion-heading">
                    <button
                      type="button"
                      className={`accordion-trigger${openIndex === i ? ' active' : ''}`}
                      onClick={() => setOpenIndex(openIndex === i ? null : i)}
                      aria-expanded={openIndex === i}
                    >
                      {faq.question}
                      <span className={`accordion-icon${openIndex === i ? ' open' : ''}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </span>
                    </button>
                  </h3>
                  {openIndex === i && (
                    <p className="accordion-body">{faq.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
