export const IMAGE_ACCEPT_STRING = 'image/*,.webp,image/webp';

export function isImageFile(file: File): boolean {
  if (file.type && file.type.startsWith('image/')) {
    return true;
  }
  return /\.(jpe?g|png|gif|webp|svg)$/i.test(file.name);
}

