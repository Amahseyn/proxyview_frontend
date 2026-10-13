export function getEditorPlainStats(html: string): { words: number; characters: number; readingMinutes: number } {
  const plain = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = plain ? plain.split(' ').length : 0;
  const characters = plain.length;
  const readingMinutes = Math.max(1, Math.ceil(words / 200));
  return { words, characters, readingMinutes };
}
