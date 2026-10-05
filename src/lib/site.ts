export const SITE_EMAIL = 'hello@proxyview.net';

/** Bare hostname used in copy and display (no protocol). */
export const SITE_DOMAIN = 'proxyview.net';

/**
 * @deprecated Use {@link getSiteDomain} or {@link getAbsoluteSiteUrl} instead.
 * Kept for backward compatibility with existing imports.
 */
export const SITE_URL = SITE_DOMAIN;

export type AppEnvironment = 'production' | 'staging' | 'development';

const DEFAULT_PRODUCTION_URL = `https://${SITE_DOMAIN}`;

/** Resolve the public site hostname (no protocol). */
export function getSiteDomain(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL;
  if (!fromEnv) return SITE_DOMAIN;

  try {
    const parsed = fromEnv.includes('://') ? new URL(fromEnv) : new URL(`https://${fromEnv}`);
    return parsed.hostname;
  } catch {
    return SITE_DOMAIN;
  }
}

/** Resolve the canonical absolute site URL (with protocol, no trailing slash). */
export function getAbsoluteSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL;
  if (!fromEnv) return DEFAULT_PRODUCTION_URL;

  if (fromEnv.includes('://')) {
    return fromEnv.replace(/\/$/, '');
  }

  return `https://${fromEnv.replace(/\/$/, '')}`;
}

/**
 * Detect deployment environment for SEO indexing rules.
 * Priority: NEXT_PUBLIC_APP_ENV → VERCEL_ENV → NODE_ENV.
 */
export function getAppEnvironment(): AppEnvironment {
  const explicit = process.env.NEXT_PUBLIC_APP_ENV?.toLowerCase();
  if (explicit === 'production' || explicit === 'staging' || explicit === 'development') {
    return explicit;
  }

  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv === 'production') return 'production';
  if (vercelEnv === 'preview') return 'staging';

  if (process.env.NODE_ENV === 'production') return 'production';
  return 'development';
}

/** Whether search engines should index this deployment. */
export function isIndexingAllowed(): boolean {
  return getAppEnvironment() === 'production';
}
