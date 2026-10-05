/** Fix UTF-8 text that was incorrectly decoded as Latin-1 (e.g. TÃ¼rkiye → Türkiye). */
export function fixUtf8Mojibake(value: string): string {
  if (!value || !/[ÃÂÐÑð]/.test(value)) return value;

  try {
    const bytes = Uint8Array.from(value, (char) => char.charCodeAt(0));
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return decoded.includes('\uFFFD') ? value : decoded;
  } catch {
    return value;
  }
}

export function getCountryName(code: string, locale = 'en'): string {
  if (!code) return '';

  try {
    const name = new Intl.DisplayNames([locale], { type: 'region' }).of(code.toUpperCase());
    return name || code;
  } catch {
    return code;
  }
}

/** Join location parts, skipping empty values and consecutive duplicates. */
export function formatLocationLine(...parts: (string | undefined)[]): string {
  const cleaned = parts
    .map((part) => (part ? fixUtf8Mojibake(part.trim()) : ''))
    .filter(Boolean);

  return cleaned.filter((part, index) => index === 0 || part !== cleaned[index - 1]).join(', ');
}
