import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AI_CRAWLER_EXTRA_DISALLOW,
  AI_ROBOTS_USER_AGENTS,
  AI_SCRAPABLE_PATHS,
} from '@/lib/cloudflare/crawl-policy';
import { buildRobots } from '@/lib/seo/robots';
import { ROBOTS_DISALLOW_PATHS } from '@/lib/seo/routes';

describe('Robots.txt generation', () => {
  const originalAppEnv = process.env.NEXT_PUBLIC_APP_ENV;
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://proxyview.net';
    vi.stubEnv('VERCEL_ENV', '');
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_ENV = originalAppEnv;
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    vi.unstubAllEnvs();
  });

  it('allows public pages and disallows private routes in production', () => {
    process.env.NEXT_PUBLIC_APP_ENV = 'production';

    const robots = buildRobots();
    const rules = Array.isArray(robots.rules) ? robots.rules : [robots.rules];
    const defaultRule = rules[0];

    expect(defaultRule?.allow).toBe('/');
    expect(defaultRule?.disallow).toEqual([...ROBOTS_DISALLOW_PATHS]);
    expect(robots.sitemap).toBe('https://proxyview.net/sitemap_index.xml');
    expect(robots.host).toBe('proxyview.net');
  });

  it('limits AI crawlers to editorial paths only', () => {
    process.env.NEXT_PUBLIC_APP_ENV = 'production';

    const robots = buildRobots();
    const rules = Array.isArray(robots.rules) ? robots.rules : [robots.rules];
    const gptRule = rules.find((r) => r?.userAgent === 'GPTBot');

    expect(gptRule?.allow).toEqual([...AI_SCRAPABLE_PATHS]);
    expect(gptRule?.disallow).toEqual([
      ...ROBOTS_DISALLOW_PATHS,
      ...AI_CRAWLER_EXTRA_DISALLOW,
    ]);
    expect(AI_ROBOTS_USER_AGENTS).toContain('GPTBot');
  });

  it('blocks all crawlers in staging', () => {
    process.env.NEXT_PUBLIC_APP_ENV = 'staging';

    const robots = buildRobots();
    const rules = Array.isArray(robots.rules) ? robots.rules[0] : robots.rules;

    expect(rules?.disallow).toBe('/');
    expect(robots.sitemap).toBeUndefined();
  });

  it('blocks all crawlers in development', () => {
    process.env.NEXT_PUBLIC_APP_ENV = 'development';

    const robots = buildRobots();
    const rules = Array.isArray(robots.rules) ? robots.rules[0] : robots.rules;

    expect(rules?.disallow).toBe('/');
    expect(robots.sitemap).toBeUndefined();
  });

  it('uses the configured site URL in the sitemap directive', () => {
    process.env.NEXT_PUBLIC_APP_ENV = 'production';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.proxyview.net';

    const robots = buildRobots();
    expect(robots.sitemap).toBe('https://www.proxyview.net/sitemap_index.xml');
  });
});
