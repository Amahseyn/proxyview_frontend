import { describe, expect, it } from 'vitest';
import {
  buildTableHtml,
  normalizeBlogPostHtml,
  rebuildTableFromHtml,
  sanitizeCellRichContent,
  sanitizeImportedHtml,
  stripStrayGreaterThanArtifacts,
} from '@/lib/richTextTable';

describe('stripStrayGreaterThanArtifacts', () => {
  it('removes a stray greater-than after a closing paragraph tag', () => {
    const input = '<p><span>Handover text.</span></p>>';
    expect(stripStrayGreaterThanArtifacts(input)).toBe('<p><span>Handover text.</span></p>');
  });
});

describe('sanitizeImportedHtml', () => {
  it('removes Google Docs off-white paragraph backgrounds', () => {
    const input = '<p style="line-height:1.95;background-color:#fcfcfc;margin-top:0pt;">Hello</p>';
    const out = sanitizeImportedHtml(input);
    expect(out).not.toContain('#fcfcfc');
    expect(out).toContain('Hello');
  });

  it('strips colgroup from pasted tables', () => {
    const input =
      '<table><colgroup><col width="100"></colgroup><tbody><tr><td>A</td></tr></tbody></table>';
    expect(sanitizeImportedHtml(input)).not.toContain('colgroup');
  });
});

describe('sanitizeCellRichContent', () => {
  it('preserves bold markup inside a cell', () => {
    const out = sanitizeCellRichContent('<span style="font-weight:700">Price</span>');
    expect(out).toContain('<p>');
    expect(out).toMatch(/Price/);
  });
});

describe('rebuildTableFromHtml', () => {
  it('outputs semantic table with thead', () => {
    const dirty =
      '<table><tbody><tr><td><p><span>Col A</span></p></td><td>Col B</td></tr><tr><td>1</td><td>2</td></tr></tbody></table>';
    const out = rebuildTableFromHtml(dirty);
    expect(out).toContain('post-content-table');
    expect(out).toContain('<thead>');
    expect(out).toContain('Col A');
    expect(out).toContain('<th scope="col">');
    expect(out).toContain('<td><p>1</p></td>');
  });
});

describe('buildTableHtml', () => {
  it('creates thead and tbody with requested dimensions', () => {
    const html = buildTableHtml(2, 3);
    expect(html).toContain('<thead>');
    expect(html).toContain('<tbody>');
    expect(html.match(/<th[\s>]/g)?.length).toBe(3);
    expect(html.match(/<tr/g)?.length).toBe(3);
  });
});
