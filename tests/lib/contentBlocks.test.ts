import { describe, expect, it } from 'vitest';
import { blocksToHtml, parseDocument, serializeDocument } from '@/lib/contentBlocks/serialize';
import { createBlockId } from '@/lib/contentBlocks/ids';

describe('contentBlocks serialize', () => {
  it('round-trips block JSON', () => {
    const blocks = [
      { id: createBlockId(), type: 'heading' as const, level: 2 as const, html: 'Hello' },
      { id: createBlockId(), type: 'paragraph' as const, html: 'World' },
    ];
    const json = serializeDocument(blocks);
    const parsed = parseDocument(json);
    expect(parsed?.blocks).toHaveLength(2);
  });

  it('renders myth vs reality and divider', () => {
    const html = blocksToHtml([
      { id: '1', type: 'mythReality', myth: 'Proxies are illegal', reality: 'Depends on use case' },
      { id: '2', type: 'divider' },
    ]);
    expect(html).toContain('pv-myth-reality');
    expect(html).toContain('<hr');
  });
});
