import { getPublishedFaqPairs, parsePostFaq } from '@/lib/postFaq';

type PostFaqSectionProps = {
  faqJson: string;
};

export default function PostFaqSection({ faqJson }: PostFaqSectionProps) {
  const doc = parsePostFaq(faqJson);
  const pairs = getPublishedFaqPairs(doc);
  if (!pairs.length) return null;

  const title = doc.sectionTitle.trim() || 'FAQ';

  return (
    <section className="post-faq" aria-labelledby="post-faq-heading">
      <h2 id="post-faq-heading">{title}</h2>
      <div className="post-faq-list">
        {pairs.map((item, index) => (
          <article key={index} className="post-faq-item">
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
