export type CloudflareConfig = {
  accountId: string;
  apiToken: string;
  zoneId: string;
};

export function getCloudflareConfig(): CloudflareConfig | null {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();
  const zoneId = process.env.CLOUDFLARE_ZONE_ID?.trim();

  if (!accountId || !apiToken || !zoneId) {
    return null;
  }

  return { accountId, apiToken, zoneId };
}

export function requireCloudflareConfig(): CloudflareConfig {
  const config = getCloudflareConfig();
  if (!config) {
    throw new Error(
      'Cloudflare is not configured. Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, and CLOUDFLARE_ZONE_ID.'
    );
  }
  return config;
}
