import type { MetadataRoute } from 'next';
import {
  AI_CRAWLER_EXTRA_DISALLOW,
  AI_ROBOTS_USER_AGENTS,
  AI_SCRAPABLE_PATHS,
  SEARCH_ROBOTS_USER_AGENTS,
} from '@/lib/cloudflare/crawl-policy';
import { getAbsoluteSiteUrl, isIndexingAllowed } from '@/lib/site';
import { ROBOTS_DISALLOW_PATHS } from '@/lib/seo/routes';

/** Build environment-aware robots.txt rules. */
export function buildRobots(): MetadataRoute.Robots {
  const siteUrl = getAbsoluteSiteUrl();

  if (!isIndexingAllowed()) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  const disallow = [...ROBOTS_DISALLOW_PATHS];
  const aiDisallow = [...ROBOTS_DISALLOW_PATHS, ...AI_CRAWLER_EXTRA_DISALLOW];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow,
      },
      ...AI_ROBOTS_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: [...AI_SCRAPABLE_PATHS],
        disallow: aiDisallow,
      })),
      ...SEARCH_ROBOTS_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow,
      })),
    ],
    sitemap: `${siteUrl}/sitemap_index.xml`,
    host: siteUrl.replace(/^https?:\/\//, ''),
  };
}
