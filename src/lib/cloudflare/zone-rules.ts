import type { CloudflareConfig } from './config';
import {
  buildAiOffLimitsExpression,
  buildAiScrapablePathExpression,
  buildCrawlerBypassExpression,
  buildPublicGetPagesExpression,
} from './crawl-policy';
import { putPhaseEntrypointRules } from './rulesets';

const PUBLIC_GET = buildPublicGetPagesExpression();
const CRAWLER_BYPASS = buildCrawlerBypassExpression();
const AI_SCRAPABLE_PATHS = buildAiScrapablePathExpression();

export async function applyCrawlerFriendlyZoneRules(config: CloudflareConfig) {
  const configRules = await putPhaseEntrypointRules(
    config,
    'http_config_settings',
    [
      {
        expression: CRAWLER_BYPASS,
        description:
          'Do not challenge AI agents on editorial paths or search bots on public pages',
        action: 'set_config',
        action_parameters: {
          bic: false,
          security_level: 'essentially_off',
        },
      },
    ],
    'ProxyView configuration rules'
  );

  const firewallRules = await putPhaseEntrypointRules(
    config,
    'http_request_firewall_custom',
    [
      {
        expression: CRAWLER_BYPASS,
        description: 'Skip legacy security products for allowed crawler traffic',
        action: 'skip',
        action_parameters: {
          products: ['bic', 'securityLevel', 'uaBlock', 'hot'],
          phases: ['http_request_firewall_managed', 'http_ratelimit'],
        },
      },
      {
        expression: buildAiOffLimitsExpression(),
        description: 'Block AI agents outside editorial sections (blog, glossary, FAQ, about)',
        action: 'block',
      },
    ],
    'ProxyView custom WAF rules'
  );

  const cacheRules = await putPhaseEntrypointRules(
    config,
    'http_request_cache_settings',
    [
      {
        expression:
          'starts_with(http.request.uri.path, "/api") or starts_with(http.request.uri.path, "/admin")',
        description: 'Never cache admin or API',
        action: 'set_cache_settings',
        action_parameters: {
          cache: false,
        },
      },
      {
        expression: `${PUBLIC_GET} and ${AI_SCRAPABLE_PATHS}`,
        description: 'Cache editorial HTML at the edge',
        action: 'set_cache_settings',
        action_parameters: {
          cache: true,
          edge_ttl: {
            mode: 'override_origin',
            default: 3600,
          },
        },
      },
      {
        expression:
          'http.request.uri.path.extension in {"js" "css" "woff2" "ico" "png" "jpg" "jpeg" "webp" "svg" "gif"}',
        description: 'Cache static assets',
        action: 'set_cache_settings',
        action_parameters: {
          cache: true,
          edge_ttl: {
            mode: 'override_origin',
            default: 86400,
          },
        },
      },
    ],
    'ProxyView cache rules'
  );

  return {
    configRules: configRules.rules.length,
    firewallRules: firewallRules.rules.length,
    cacheRules: cacheRules.rules.length,
  };
}
