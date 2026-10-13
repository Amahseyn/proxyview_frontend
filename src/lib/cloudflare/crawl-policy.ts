/** Paths where AI agents may scrape (editorial / reference content). */
export const AI_SCRAPABLE_PATHS = [
  '/',
  '/blog',
  '/glossary',
  '/faq',
  '/about_us',
  '/sitemap_index.xml',
  '/sitemap.xml',
  '/page-sitemap.xml',
  '/post-sitemap.xml',
  '/category-sitemap.xml',
  '/robots.txt',
] as const;

/** Extra paths blocked for AI crawlers only (tools, forms, legal). */
export const AI_CRAWLER_EXTRA_DISALLOW = [
  '/proxy-checker',
  '/contact_us',
  '/privacy-policy',
  '/terms_conditions',
] as const;

/** Well-known AI and agent crawlers (not traditional search indexers). */
export const AI_USER_AGENT_TOKENS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Bytespider',
  'CCBot',
  'Amazonbot',
  'meta-externalagent',
] as const;

/** robots.txt user-agent names for {@link AI_USER_AGENT_TOKENS}. */
export const AI_ROBOTS_USER_AGENTS = [...AI_USER_AGENT_TOKENS] as const;

/** Search engines and SEO tools — may index the full public site. */
export const SEARCH_USER_AGENT_TOKENS = [
  'Googlebot',
  'bingbot',
  'Applebot',
  'DuckDuckBot',
  'YandexBot',
  'FacebookBot',
  'facebookexternalhit',
  'Twitterbot',
  'LinkedInBot',
  'Slurp',
  'SemrushBot',
  'AhrefsBot',
] as const;

export const SEARCH_ROBOTS_USER_AGENTS = [...SEARCH_USER_AGENT_TOKENS] as const;

/** All crawlers for Cloudflare WAF skip / config (AI + search + dev tools). */
export const CRAWLER_USER_AGENT_TOKENS = [
  ...SEARCH_USER_AGENT_TOKENS,
  ...AI_USER_AGENT_TOKENS,
  'curl/',
  'python-requests',
  'httpx/',
  'Go-http-client',
] as const;

/** @deprecated Use {@link AI_ROBOTS_USER_AGENTS} or {@link SEARCH_ROBOTS_USER_AGENTS}. */
export const CRAWLER_ROBOTS_USER_AGENTS = [
  ...AI_ROBOTS_USER_AGENTS,
  ...SEARCH_ROBOTS_USER_AGENTS,
] as const;

/** Cloudflare Rules language: editorial content safe for AI scraping. */
export function buildAiScrapablePathExpression(): string {
  return [
    '(',
    'http.request.uri.path eq "/"',
    'or http.request.uri.path eq "/blog"',
    'or starts_with(http.request.uri.path, "/blog/")',
    'or http.request.uri.path eq "/glossary"',
    'or http.request.uri.path eq "/faq"',
    'or http.request.uri.path eq "/about_us"',
    'or http.request.uri.path eq "/sitemap_index.xml"',
    'or http.request.uri.path eq "/sitemap.xml"',
    'or http.request.uri.path eq "/page-sitemap.xml"',
    'or http.request.uri.path eq "/post-sitemap.xml"',
    'or http.request.uri.path eq "/category-sitemap.xml"',
    'or http.request.uri.path eq "/robots.txt"',
    ')',
  ].join(' ');
}

export function buildPublicGetPagesExpression(): string {
  return [
    '(http.request.method eq "GET"',
    'and not starts_with(http.request.uri.path, "/admin")',
    'and not starts_with(http.request.uri.path, "/api"))',
  ].join(' ');
}

function buildUserAgentExpression(tokens: readonly string[]): string {
  const parts = tokens.map((token) => `http.user_agent contains "${token}"`);
  return `(${parts.join(' or ')})`;
}

export function buildAiAgentUserAgentExpression(): string {
  return buildUserAgentExpression(AI_USER_AGENT_TOKENS);
}

export function buildSearchCrawlerUserAgentExpression(): string {
  return buildUserAgentExpression(SEARCH_USER_AGENT_TOKENS);
}

export function buildCrawlerUserAgentExpression(): string {
  return buildUserAgentExpression(CRAWLER_USER_AGENT_TOKENS);
}

/** AI agents on blog, glossary, FAQ, about, and discovery files only. */
export function buildAiScrapableCrawlerExpression(): string {
  return `(http.request.method eq "GET" and ${buildAiScrapablePathExpression()}) and ${buildAiAgentUserAgentExpression()}`;
}

/** Search bots on any public page (SEO). */
export function buildSearchCrawlerPublicExpression(): string {
  return `(${buildPublicGetPagesExpression()}) and ${buildSearchCrawlerUserAgentExpression()}`;
}

/** Combined crawler bypass expression for configuration / WAF rules. */
export function buildCrawlerBypassExpression(): string {
  return `(${buildAiScrapableCrawlerExpression()}) or (${buildSearchCrawlerPublicExpression()})`;
}

/** Block AI agents when they request non-editorial pages. */
export function buildAiOffLimitsExpression(): string {
  return `(http.request.method eq "GET" and ${buildAiAgentUserAgentExpression()} and not ${buildAiScrapablePathExpression()})`;
}
