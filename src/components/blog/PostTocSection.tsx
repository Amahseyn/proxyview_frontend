'use client';

import { useEffect, useState } from 'react';
import { getPublishedTocItems, parsePostToc } from '@/lib/postToc';

type PostTocSectionProps = {
  tocJson: string;
};

export default function PostTocSection({ tocJson }: PostTocSectionProps) {
  const doc = parsePostToc(tocJson);
  const items = getPublishedTocItems(doc);
  const [activeAnchor, setActiveAnchor] = useState('');
  const [progress, setProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const tocItems = getPublishedTocItems(parsePostToc(tocJson));
    if (!tocItems.length) return;

    const headings = tocItems
      .map(item => document.getElementById(item.anchor))
      .filter((heading): heading is HTMLElement => Boolean(heading));
    if (!headings.length) return;

    const article = document.querySelector<HTMLElement>('.post-single-content');
    let frame = 0;

    const update = () => {
      frame = 0;

      // The sticky navbar is 64px tall; highlight the heading just below it.
      const offset = 104;
      let current = headings[0].id;
      let closestTop = Number.NEGATIVE_INFINITY;
      for (const heading of headings) {
        const top = heading.getBoundingClientRect().top;
        if (top <= offset && top > closestTop) {
          closestTop = top;
          current = heading.id;
        }
      }
      setActiveAnchor(current);

      if (article) {
        const rect = article.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight * 0.6;
        const value = scrollable > 0 ? (offset - rect.top) / scrollable : 0;
        setProgress(Math.min(1, Math.max(0, value)));
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [tocJson]);

  if (!items.length) return null;

  const title = doc.sectionTitle.trim() || 'Table of contents';

  return (
    <nav className="post-toc" aria-labelledby="post-toc-heading">
      <div className="post-toc-head">
        <h2 id="post-toc-heading">{title}</h2>
        <span className="post-toc-count">{items.length} sections</span>
        <button
          type="button"
          className="post-toc-toggle"
          aria-expanded={isOpen}
          aria-controls="post-toc-body"
          onClick={() => setIsOpen(open => !open)}
        >
          {isOpen ? 'Hide' : 'Show'}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m6 9 6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div
        id="post-toc-body"
        className={`post-toc-body${isOpen ? '' : ' is-collapsed'}`}
      >
        <div className="post-toc-progress" aria-hidden="true">
          <span style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <ol className="post-toc-list">
          {items.map((item, index) => {
            const isActive = activeAnchor === item.anchor;
            return (
              <li
                key={`${item.anchor}-${index}`}
                className={`post-toc-item post-toc-item--h${item.level}`}
              >
                <a
                  href={`#${item.anchor}`}
                  className={isActive ? 'is-active' : undefined}
                  aria-current={isActive ? 'location' : undefined}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
