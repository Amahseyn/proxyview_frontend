/**
 * Verify the Cloudflare API token and apply recommended zone settings.
 * Loads CLOUDFLARE_* from proxyview_frontend/.env (via dotenv if present).
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  applyRecommendedZoneSettings,
  verifyCloudflareToken,
} from '../src/lib/cloudflare/client';
import { applyCrawlerFriendlyBotManagement } from '../src/lib/cloudflare/bot-policy';
import { applyCrawlerFriendlyZoneRules } from '../src/lib/cloudflare/zone-rules';
import { requireCloudflareConfig } from '../src/lib/cloudflare/config';

function loadEnvFile() {
  const envPath = resolve(__dirname, '../.env');
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadEnvFile();
  const config = requireCloudflareConfig();

  const verification = await verifyCloudflareToken(config);
  console.log(`Token status: ${verification.status} (${verification.id})`);

  const applied = await applyRecommendedZoneSettings(config);
  console.log('Applied zone settings:');
  for (const row of applied) {
    console.log(`  ${row.setting} = ${row.value}`);
  }

  const botPolicy = await applyCrawlerFriendlyBotManagement(config);
  console.log('Applied bot / AI crawl policy:');
  console.log(`  ai_training=${botPolicy.ai_training} ai_search=${botPolicy.ai_search} ai_user=${botPolicy.ai_user}`);
  console.log(`  managed_robots_txt=${botPolicy.is_robots_txt_managed}`);

  const rules = await applyCrawlerFriendlyZoneRules(config);
  console.log('Applied zone rules:');
  console.log(`  configuration rules: ${rules.configRules}`);
  console.log(`  custom WAF rules: ${rules.firewallRules}`);
  console.log(`  cache rules: ${rules.cacheRules}`);
  console.log(
    'Note: Markdown for Agents (content_converter) requires Cloudflare Pro+. Free plan uses HTML + robots.txt for agents.'
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
