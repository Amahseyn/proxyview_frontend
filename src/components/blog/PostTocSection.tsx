import { getPublishedTocItems, parsePostToc } from '@/lib/postToc';

type PostTocSectionProps = {
  tocJson: string;
};

export default function PostTocSection({ tocJson }: PostTocSectionProps) {
  const doc = parsePostToc(tocJson);
  const items = getPublishedTocItems(doc);
  if (!items.length) return null;

  const title = doc.sectionTitle.trim() || 'Table of contents';

  return (
    <nav className="post-toc" aria-labelledby="post-toc-heading">
      <h2 id="post-toc-heading">{title}</h2>
      <ol className="post-toc-list">
        {items.map(item => (
          <li
            key={item.id}
            className={`post-toc-item post-toc-item--h${item.level}`}
          >
            <a href={`#${item.anchor}`}>{item.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
