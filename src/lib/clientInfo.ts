export type ClientInfo = {
  browser: string;
  browserVersion: string;
  os: string;
  platform: string;
  language: string;
  mobile: boolean;
};

export function getClientInfo(): ClientInfo {
  if (typeof navigator === 'undefined') {
    return {
      browser: 'Unknown',
      browserVersion: '',
      os: 'Unknown',
      platform: 'Unknown',
      language: 'Unknown',
      mobile: false,
    };
  }

  const ua = navigator.userAgent;
  const platform = navigator.platform || 'Unknown';
  const language = navigator.language || 'Unknown';
  const mobile = /Mobi|Android|iPhone|iPad/i.test(ua);

  let browser = 'Unknown';
  let browserVersion = '';

  if (ua.includes('Firefox/')) {
    browser = 'Firefox';
    browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] ?? '';
  } else if (ua.includes('Edg/')) {
    browser = 'Edge';
    browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] ?? '';
  } else if (ua.includes('OPR/') || ua.includes('Opera')) {
    browser = 'Opera';
    browserVersion = ua.match(/(?:OPR|Opera)\/([\d.]+)/)?.[1] ?? '';
  } else if (ua.includes('Chrome/')) {
    browser = 'Chrome';
    browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] ?? '';
  } else if (ua.includes('Safari/')) {
    browser = 'Safari';
    browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] ?? '';
  }

  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS X') || ua.includes('Macintosh')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('CrOS')) os = 'Chrome OS';

  return { browser, browserVersion, os, platform, language, mobile };
}

/** ISO 3166-1 alpha-2 → emoji flag */
export function countryCodeToEmoji(code: string): string {
  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) return '🌐';
  const base = 127397;
  return [...normalized].map((char) => String.fromCodePoint(base + char.charCodeAt(0))).join('');
}

export function countryFlagUrl(code: string, size = 40): string {
  const normalized = code.trim().toLowerCase();
  if (!/^[a-z]{2}$/.test(normalized)) return '';
  return `https://flagcdn.com/w${size}/${normalized}.png`;
}
