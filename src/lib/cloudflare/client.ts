import type { CloudflareConfig } from './config';

type CloudflareApiResponse<T> = {
  success: boolean;
  errors: { code: number; message: string }[];
  messages: { message: string }[];
  result: T;
};

async function cloudflareFetch<T>(
  config: CloudflareConfig,
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  const body = (await response.json()) as CloudflareApiResponse<T>;
  if (!response.ok || !body.success) {
    const detail = body.errors?.map((e) => e.message).join('; ') || response.statusText;
    throw new Error(`Cloudflare API error: ${detail}`);
  }

  return body.result;
}

export async function verifyCloudflareToken(config: CloudflareConfig) {
  return cloudflareFetch<{ id: string; status: string }>(
    config,
    `/accounts/${config.accountId}/tokens/verify`
  );
}

export async function patchZoneSetting(
  config: CloudflareConfig,
  settingId: string,
  value: string | number | boolean
) {
  return cloudflareFetch<{ id: string; value: string }>(
    config,
    `/zones/${config.zoneId}/settings/${settingId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ value }),
    }
  );
}

/** Recommended production settings for proxyview.net behind Cloudflare. */
export const RECOMMENDED_ZONE_SETTINGS: Record<string, string | number | boolean> = {
  ssl: 'strict',
  always_use_https: 'on',
  min_tls_version: '1.2',
  tls_1_3: 'on',
  automatic_https_rewrites: 'on',
  websockets: 'on',
  brotli: 'on',
  http3: 'on',
};

export async function applyRecommendedZoneSettings(config: CloudflareConfig) {
  const applied: { setting: string; value: string }[] = [];

  for (const [setting, value] of Object.entries(RECOMMENDED_ZONE_SETTINGS)) {
    const result = await patchZoneSetting(config, setting, value);
    applied.push({ setting, value: result.value });
  }

  return applied;
}
