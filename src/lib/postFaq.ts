import { createBlockId } from '@/lib/contentBlocks/ids';

export interface PostFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface PostFaqDocument {
  sectionTitle: string;
  items: PostFaqItem[];
}

export const DEFAULT_FAQ_SECTION_TITLE = 'FAQ';

export function emptyPostFaqDocument(): PostFaqDocument {
  return { sectionTitle: DEFAULT_FAQ_SECTION_TITLE, items: [] };
}

export function createPostFaqItem(partial?: Partial<Pick<PostFaqItem, 'question' | 'answer'>>): PostFaqItem {
  return {
    id: createBlockId(),
    question: partial?.question ?? '',
    answer: partial?.answer ?? '',
  };
}

export function parsePostFaq(faqJson: string | undefined | null): PostFaqDocument {
  if (!faqJson?.trim()) return emptyPostFaqDocument();
  try {
    const data = JSON.parse(faqJson) as Partial<PostFaqDocument>;
    const sectionTitle =
      typeof data.sectionTitle === 'string' && data.sectionTitle.trim()
        ? data.sectionTitle.trim()
        : DEFAULT_FAQ_SECTION_TITLE;
    const items = Array.isArray(data.items)
      ? data.items
          .filter(item => item && typeof item === 'object')
          .map(item => {
            const row = item as Partial<PostFaqItem>;
            return {
              id: typeof row.id === 'string' && row.id ? row.id : createBlockId(),
              question: typeof row.question === 'string' ? row.question : '',
              answer: typeof row.answer === 'string' ? row.answer : '',
            };
          })
      : [];
    return { sectionTitle, items };
  } catch {
    return emptyPostFaqDocument();
  }
}

export function serializePostFaq(doc: PostFaqDocument): string {
  return JSON.stringify({
    sectionTitle: doc.sectionTitle.trim() || DEFAULT_FAQ_SECTION_TITLE,
    items: doc.items.map(item => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
    })),
  });
}

export function hasPostFaqContent(doc: PostFaqDocument): boolean {
  return doc.items.some(item => item.question.trim() || item.answer.trim());
}

export function getPublishedFaqPairs(doc: PostFaqDocument): { question: string; answer: string }[] {
  return doc.items
    .filter(item => item.question.trim() && item.answer.trim())
    .map(item => ({ question: item.question.trim(), answer: item.answer.trim() }));
}
