import { describe, expect, it } from 'vitest';
import {
  applyTocAnchorsToHtml,
  createPostTocItem,
  emptyPostTocDocument,
  extractTocFromHtml,
  getPublishedTocItems,
  parsePostToc,
  serializePostToc,
} from '@/lib/postToc';

describe('postToc', () => {
  it('round-trips TOC JSON', () => {
    const doc = {
      ...emptyPostTocDocument(),
      sectionTitle: 'On this page',
      items: [createPostTocItem({ label: 'Intro', anchor: 'intro', level: 2 })],
    };
    const json = serializePostToc(doc);
    const parsed = parsePostToc(json);
    expect(parsed.sectionTitle).toBe('On this page');
    expect(parsed.items[0].label).toBe('Intro');
    expect(parsed.items[0].anchor).toBe('intro');
  });

  it('extracts headings from HTML', () => {
    const html = '<p>x</p><h2>First</h2><h3>Nested</h3>';
    const items = extractTocFromHtml(html);
    expect(items).toHaveLength(2);
    expect(items[0].label).toBe('First');
    expect(items[1].level).toBe(3);
  });

  it('injects anchor ids into matching headings', () => {
    const items = getPublishedTocItems(
      parsePostToc(
        serializePostToc({
          ...emptyPostTocDocument(),
          items: [createPostTocItem({ label: 'First', anchor: 'first', level: 2 })],
        }),
      ),
    );
    const out = applyTocAnchorsToHtml('<h2>First</h2>', items);
    expect(out).toContain('id="first"');
  });
});
