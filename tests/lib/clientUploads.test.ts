import { describe, expect, it } from 'vitest';
import { IMAGE_ACCEPT_STRING, isImageFile } from '@/lib/clientUploads';

describe('clientUploads', () => {
  it('exposes IMAGE_ACCEPT_STRING with WebP support', () => {
    expect(IMAGE_ACCEPT_STRING).toContain('.webp');
    expect(IMAGE_ACCEPT_STRING).toContain('image/webp');
  });

  it('identifies webp files by MIME type', () => {
    const file = new File(['content'], 'test.webp', { type: 'image/webp' });
    expect(isImageFile(file)).toBe(true);
  });

  it('identifies webp files by extension even when MIME type is missing', () => {
    const fileNoMime = new File(['content'], 'banner.webp', { type: '' });
    expect(isImageFile(fileNoMime)).toBe(true);

    const fileOctet = new File(['content'], 'photo.WEBP', { type: 'application/octet-stream' });
    expect(isImageFile(fileOctet)).toBe(true);
  });

  it('identifies standard image types by MIME and extension', () => {
    expect(isImageFile(new File(['content'], 'img.png', { type: 'image/png' }))).toBe(true);
    expect(isImageFile(new File(['content'], 'img.jpg', { type: 'image/jpeg' }))).toBe(true);
    expect(isImageFile(new File(['content'], 'img.svg', { type: '' }))).toBe(true);
    expect(isImageFile(new File(['content'], 'img.gif', { type: 'image/gif' }))).toBe(true);
  });

  it('rejects non-image files', () => {
    expect(isImageFile(new File(['content'], 'doc.pdf', { type: 'application/pdf' }))).toBe(false);
    expect(isImageFile(new File(['content'], 'data.txt', { type: 'text/plain' }))).toBe(false);
    expect(isImageFile(new File(['content'], 'archive.zip', { type: '' }))).toBe(false);
  });
});

