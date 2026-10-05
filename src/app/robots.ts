import type { MetadataRoute } from 'next';
import { buildRobots } from '@/lib/seo/robots';

/** Evaluate robots rules at request time so staging/dev can block crawlers. */
export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  return buildRobots();
}
