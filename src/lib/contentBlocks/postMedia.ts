import { parseDocument } from '@/lib/contentBlocks/serialize';
import type { ContentBlock } from '@/lib/contentBlocks/types';

export type PostMediaKind = 'featured' | 'image' | 'video';

export type PostMediaEntry = {
  kind: PostMediaKind;
  url: string;
  blockId?: string;
  label?: string;
  embedUrl?: string;
};

export function collectPostMedia(blocksJson: string, featuredUrl?: string): PostMediaEntry[] {
  const entries: PostMediaEntry[] = [];
  const seen = new Set<string>();

  const thumb = featuredUrl?.trim();
  if (thumb) {
    entries.push({ kind: 'featured', url: thumb, label: 'Featured image' });
    seen.add(thumb);
  }

  const doc = parseDocument(blocksJson);
  if (!doc?.blocks.length) return entries;

  for (const block of doc.blocks) {
    if (block.type === 'image') {
      const url = block.src.trim();
      if (!url || seen.has(url)) continue;
      seen.add(url);
      entries.push({
        kind: 'image',
        url,
        blockId: block.id,
        label: block.alt?.trim() || 'Image block',
      });
    }
    if (block.type === 'video') {
      const url = block.embedUrl.trim() || block.src.trim();
      if (!url || seen.has(url)) continue;
      seen.add(url);
      entries.push({
        kind: 'video',
        url,
        blockId: block.id,
        embedUrl: block.embedUrl,
        label: block.caption?.trim() || 'Video block',
      });
    }
  }

  return entries;
}

export function countContentMedia(blocks: ContentBlock[]): { images: number; videos: number } {
  let images = 0;
  let videos = 0;
  for (const block of blocks) {
    if (block.type === 'image' && block.src.trim()) images += 1;
    if (block.type === 'video' && (block.embedUrl.trim() || block.src.trim())) videos += 1;
  }
  return { images, videos };
}

export function isVideoEmbedUrl(url: string): boolean {
  return /youtube|youtu\.be|vimeo|dailymotion/i.test(url);
}

export function videoPreviewPoster(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/i);
  if (yt?.[1]) return `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg`;
  return null;
}
