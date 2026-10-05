import type { CloudflareConfig } from './config';

type BotManagementSettings = {
  enable_js?: boolean;
  fight_mode?: boolean;
  ai_bots_protection?: string;
  content_bots_protection?: string;
  crawler_protection?: string;
  ai_training?: string;
  ai_search?: string;
  ai_user?: string;
  is_robots_txt_managed?: boolean;
  bot_preference_sync_enabled?: boolean;
};

type CloudflareApiResponse<T> = {
  success: boolean;
  errors: { message: string }[];
  result: T;
};

/**
 * Allow search, agent, and training crawlers on public content.
 * Uses "disabled" for AI policies (Cloudflare: do not block that category).
 */
export const CRAWLER_FRIENDLY_BOT_MANAGEMENT: BotManagementSettings = {
  fight_mode: false,
  ai_bots_protection: 'disabled',
  content_bots_protection: 'disabled',
  crawler_protection: 'disabled',
  ai_training: 'disabled',
  ai_search: 'disabled',
  ai_user: 'disabled',
  is_robots_txt_managed: false,
  bot_preference_sync_enabled: false,
};

export async function applyCrawlerFriendlyBotManagement(config: CloudflareConfig) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${config.zoneId}/bot_management`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(CRAWLER_FRIENDLY_BOT_MANAGEMENT),
    }
  );

  const body = (await response.json()) as CloudflareApiResponse<BotManagementSettings>;
  if (!response.ok || !body.success) {
    const detail = body.errors?.map((e) => e.message).join('; ') || response.statusText;
    throw new Error(`Cloudflare Bot Management API error: ${detail}`);
  }

  return body.result;
}
