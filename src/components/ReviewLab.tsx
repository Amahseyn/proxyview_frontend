'use client';
import { useState } from 'react';
import Image from 'next/image';

const accordionItems = [
  {
    title: 'Research Analyst',
    body: 'Digs deep into proxy providers\' features, pricing models, legal terms, privacy policies, and user reputation. They flag what matters for real-world use and identify red flags early—no marketing fluff, just facts that affect your business.',
  },
  {
    title: 'Technical Tester',
    body: 'Runs each tool through controlled tests, checking IP stability, rotation accuracy, speed, protocol support, and anti-detect resistance. Their role is to uncover what actually works—and what doesn\'t—across real scenarios like scraping, automation, and multi-accounting.',
  },
  {
    title: 'Writer',
    body: 'Translates raw data into readable insights. They organize findings into clear takeaways, explain technical concepts without jargon, and make sure readers actually understand the difference between a proxy that "works" and one that wins long-term.',
  },
  {
    title: 'Fact-Checker',
    body: 'Verifies every claim, stat, and quote before anything goes live. This expert ensures ProxyView content is trustworthy, consistent, and as accurate as the tools we cover.',
  },
];

export default function ReviewLab() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="reviewlab section">
      <div className="container">
        <div className="section-header">
          <h2>ProxyView Review Lab</h2>
        </div>
        <p className="section-subheader">
          Every review at ProxyView is a team effort built on real testing, critical analysis,
          and expert writing. Here&apos;s who makes it happen:
        </p>

        <div className="reviewlab-inner">
          <div className="accordion">
            {accordionItems.map((item, i) => (
              <div key={i} className="accordion-item">
                <button
                  className={`accordion-trigger${openIndex === i ? ' active' : ''}`}
                  onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                  aria-expanded={openIndex === i}
                >
                  <span>{item.title}</span>
                  <span className={`accordion-icon${openIndex === i ? ' open' : ''}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </span>
                </button>
                {openIndex === i && (
                  <div className="accordion-body">{item.body}</div>
                )}
              </div>
            ))}
          </div>

          <div className="reviewlab-image-col">
            <Image
              src="/images/Quicksand.png"
              alt="ProxyView Review Team"
              width={340}
              height={340}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
