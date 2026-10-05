import type { CloudflareConfig } from './config';

type RulesetRule = {
  expression: string;
  description: string;
  action: string;
  action_parameters?: Record<string, unknown>;
  enabled?: boolean;
};

type CloudflareApiResponse<T> = {
  success: boolean;
  errors: { code: number; message: string }[];
  result: T;
};

async function rulesetFetch<T>(
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
    throw new Error(`Cloudflare Rulesets API error: ${detail}`);
  }

  return body.result;
}

export async function putPhaseEntrypointRules(
  config: CloudflareConfig,
  phase: string,
  rules: RulesetRule[],
  description?: string
) {
  return rulesetFetch<{ id: string; rules: RulesetRule[] }>(
    config,
    `/zones/${config.zoneId}/rulesets/phases/${phase}/entrypoint`,
    {
      method: 'PUT',
      body: JSON.stringify({
        description: description ?? `ProxyView ${phase}`,
        rules,
      }),
    }
  );
}
