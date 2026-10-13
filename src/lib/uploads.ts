import path from 'path';

export const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
] as const;

export const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'] as const;

export const ALLOWED_MIME_TYPES = [...ALLOWED_IMAGE_MIME_TYPES, ...ALLOWED_VIDEO_MIME_TYPES] as const;

export const EXTENSION_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
};

export const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
};

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

export function resolveUploadMimeType(file: File): string | null {
  if (file.type && (ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return file.type;
  }

  const ext = path.extname(file.name).toLowerCase();
  const mimeFromExt = EXTENSION_TO_MIME[ext];
  if (mimeFromExt && (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeFromExt)) {
    return mimeFromExt;
  }

  return null;
}

export function resolveUploadExtension(file: File, mimeType: string): string {
  const extFromName = path.extname(file.name).toLowerCase();
  if (extFromName && EXTENSION_TO_MIME[extFromName] === mimeType) {
    return extFromName;
  }

  return MIME_TO_EXTENSION[mimeType] || '.jpg';
}

export function buildUploadFilename(file: File, mimeType: string): string {
  const ext = resolveUploadExtension(file, mimeType);
  const prefix = mimeType.startsWith('video/') ? 'vid' : 'img';
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
}

export function getUploadServePath(filename: string): string {
  return `/api/uploads/${filename}`;
}

export function getUploadContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return EXTENSION_TO_MIME[ext] || 'application/octet-stream';
}

export function isSafeUploadFilename(filename: string): boolean {
  return /^(img|vid)-\d+-\d+\.(jpe?g|png|gif|webp|svg|mp4|webm|mov)$/i.test(filename);
}
