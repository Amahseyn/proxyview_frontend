import path from 'path';

export const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
] as const;

export const EXTENSION_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

export const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
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
  return `img-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
}

export function getUploadServePath(filename: string): string {
  return `/api/uploads/${filename}`;
}

export function getUploadContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return EXTENSION_TO_MIME[ext] || 'application/octet-stream';
}

export function isSafeUploadFilename(filename: string): boolean {
  return /^img-\d+-\d+\.(jpe?g|png|gif|webp|svg)$/i.test(filename);
}
