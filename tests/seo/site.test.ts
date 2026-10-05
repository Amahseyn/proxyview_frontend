import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getAbsoluteSiteUrl,
  getAppEnvironment,
  getSiteDomain,
  isIndexingAllowed,
} from '@/lib/site';

describe('Site URL and environment helpers', () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const originalAppEnv = process.env.NEXT_PUBLIC_APP_ENV;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    process.env.NEXT_PUBLIC_APP_ENV = originalAppEnv;
    vi.unstubAllEnvs();
  });

  it('resolves absolute site URL from full NEXT_PUBLIC_SITE_URL', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://proxyview.net/';
    expect(getAbsoluteSiteUrl()).toBe('https://proxyview.net');
    expect(getSiteDomain()).toBe('proxyview.net');
  });

  it('resolves absolute site URL from bare hostname', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'proxyview.net';
    expect(getAbsoluteSiteUrl()).toBe('https://proxyview.net');
  });

  it('falls back to the default production domain', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(getAbsoluteSiteUrl()).toBe('https://proxyview.net');
  });

  it('detects environment from NEXT_PUBLIC_APP_ENV', () => {
    process.env.NEXT_PUBLIC_APP_ENV = 'staging';
    expect(getAppEnvironment()).toBe('staging');
    expect(isIndexingAllowed()).toBe(false);
  });

  it('maps VERCEL_ENV preview to staging', () => {
    delete process.env.NEXT_PUBLIC_APP_ENV;
    vi.stubEnv('VERCEL_ENV', 'preview');
    expect(getAppEnvironment()).toBe('staging');
    expect(isIndexingAllowed()).toBe(false);
  });
});
