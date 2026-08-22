'use client';
import { useState } from 'react';
import Link from 'next/link';

const faqs = [
  {
    q: 'What is a proxy server?',
    a: 'A proxy server acts as an intermediary between your device and the internet. When you make a request through a proxy, it routes the traffic through its own IP address, masking your real IP and providing anonymity, geo-flexibility, and request distribution.',
  },
  {
    q: 'What is the difference between residential and datacenter proxies?',
    a: 'Residential proxies use IP addresses assigned by ISPs to real home devices, making them highly authentic and hard to detect. Datacenter proxies are hosted on cloud servers — they are faster and cheaper but more easily flagged by anti-bot systems.',
  },
  {
    q: 'What is an anti-detect browser?',
    a: 'An anti-detect browser is a specialized browser that allows you to create isolated browser profiles with unique fingerprints (user agent, canvas, WebGL, fonts, etc.). This prevents websites from linking multiple accounts or sessions to the same user.',
  },
  {
    q: 'How do I use proxies for web scraping?',
    a: 'Configure your scraping tool to route requests through a proxy or proxy pool. For best results, use rotating residential proxies, implement request delays, and mimic human browsing patterns to avoid detection and rate limiting.',
  },
  {
    q: 'Are proxies legal to use?',
    a: 'Using proxies is generally legal. However, you should always review the terms of service of the websites you access and comply with applicable laws. Scraping publicly available data is typically legal, but accessing private data or circumventing authentication is not.',
  },
  {
    q: 'What proxy type should I use for social media management?',
    a: 'For social media account management, residential or mobile proxies are strongly recommended. Social platforms use advanced bot detection, and datacenter IPs are frequently flagged. Each account should have its own dedicated IP to avoid cross-contamination.',
  },
  {
    q: 'How does ProxyView test proxy providers?',
    a: 'Our Technical Testers run each provider through a controlled benchmark covering IP stability, rotation accuracy, response speed, protocol support (HTTP/HTTPS/SOCKS5), and anti-detect resistance against real target websites. Results are compiled independently.',
  },
  {
    q: 'Does ProxyView accept sponsored reviews?',
    a: 'No. ProxyView does not accept payment for reviews or rankings. We may have affiliate relationships with some providers, but our editorial process is fully independent. We disclose any affiliate relationships clearly.',
  },
];

export default function FaqList() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>Frequently Asked Questions</h1>
          <p>Everything you need to know about proxies, anti-detect tools, and ProxyView.</p>
        </div>
      </div>
      <section className="faq-page section">
        <div className="container">
          <div className="faq-inner">
            <p className="faq-intro">
              Can&#39;t find what you&#39;re looking for?{' '}
              <Link href="/contact_us" style={{ color: 'var(--primary)', fontWeight: 600 }}>Contact us</Link>{' '}
              and we&#39;ll be happy to help.
            </p>
            <div className="accordion">
              {faqs.map((faq, i) => (
                <div key={i} className="accordion-item">
                  <button
                    className={`accordion-trigger${openIndex === i ? ' active' : ''}`}
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    aria-expanded={openIndex === i}
                  >
                    <span>{faq.q}</span>
                    <span className={`accordion-icon${openIndex === i ? ' open' : ''}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </span>
                  </button>
                  {openIndex === i && (
                    <div className="accordion-body">{faq.a}</div>
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
