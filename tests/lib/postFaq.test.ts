import { describe, expect, it } from 'vitest';
import {
  getPublishedFaqPairs,
  parsePostFaq,
  serializePostFaq,
  emptyPostFaqDocument,
  createPostFaqItem,
} from '@/lib/postFaq';

describe('postFaq', () => {
  it('round-trips FAQ JSON', () => {
    const doc = {
      ...emptyPostFaqDocument(),
      sectionTitle: 'Common questions',
      items: [createPostFaqItem({ question: 'Q1?', answer: 'A1' })],
    };
    const json = serializePostFaq(doc);
    const parsed = parsePostFaq(json);
    expect(parsed.sectionTitle).toBe('Common questions');
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0].question).toBe('Q1?');
  });

  it('filters published pairs with both question and answer', () => {
    const doc = parsePostFaq(
      serializePostFaq({
        sectionTitle: 'FAQ',
        items: [
          createPostFaqItem({ question: 'Ok?', answer: 'Yes' }),
          createPostFaqItem({ question: 'Incomplete', answer: '' }),
        ],
      })
    );
    expect(getPublishedFaqPairs(doc)).toHaveLength(1);
  });
});
