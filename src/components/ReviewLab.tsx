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
      <div className="reviewlab-inner">
        {/* Left: heading + accordion */}
        <div>
          <div className="reviewlab-star-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#star_clip)">
                <path d="M11.9751 0C12.8445 2.82022 14.3896 5.38537 16.4762 7.47239C18.5628 9.55941 21.1276 11.1051 23.9477 11.9751C21.1276 12.8451 18.5628 14.3908 16.4762 16.4778C14.3896 18.5648 12.8445 21.13 11.9751 23.9502C11.1055 21.1297 9.55991 18.5643 7.47287 16.4773C5.38583 14.3903 2.8205 12.8447 0 11.9751C2.8205 11.1055 5.38583 9.55991 7.47287 7.47287C9.55991 5.38583 11.1055 2.8205 11.9751 0Z" fill="black"/>
              </g>
              <defs>
                <clipPath id="star_clip">
                  <rect width="23.9477" height="23.9477" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </div>

          <h2 className="reviewlab-title">ProxyView Review Lab</h2>
          <p className="reviewlab-subtitle">
            Every review at ProxyView is a team effort built on real testing, critical analysis,
            and expert writing. Here's who makes it happen:
          </p>

          <div className="accordion" style={{ marginTop: '36px' }}>
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
        </div>

        {/* Right: image */}
        <div className="reviewlab-image-col">
          <Image
            src="/images/Quicksand.png"
            alt="ProxyView Review Team"
            width={340}
            height={340}
          />
        </div>
      </div>
    </section>
  );
}
