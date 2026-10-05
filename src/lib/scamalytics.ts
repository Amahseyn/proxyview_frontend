import { fixUtf8Mojibake, getCountryName } from '@/lib/textEncoding';

export interface ScamalyticsProxyFlags {
  is_datacenter: boolean;
  is_vpn: boolean;
  is_apple_icloud_private_relay: boolean;
  is_amazon_aws: boolean;
  is_google: boolean;
}

export interface ScamalyticsResult {
  ip: string;
  score: number;
  risk: string;
  ispRisk: string;
  ispScore: number;
  reportUrl: string;
  proxy: ScamalyticsProxyFlags;
  isBlacklisted: boolean;
  isTor: boolean;
  proxyType: string;
  location: {
    country: string;
    countryCode: string;
    city: string;
    region: string;
  };
  isp: string;
  org: string;
  asn: string;
  mode: string;
}

interface ScamalyticsApiResponse {
  scamalytics?: {
    status: string;
    mode?: string;
    ip?: string;
    error?: string;
    scamalytics_score?: number;
    scamalytics_risk?: string;
    scamalytics_url?: string;
    scamalytics_isp?: string;
    scamalytics_org?: string;
    scamalytics_isp_score?: number;
    scamalytics_isp_risk?: string;
    scamalytics_proxy?: ScamalyticsProxyFlags;
    is_blacklisted_external?: boolean;
  };
  external_datasources?: {
    ip2proxy_lite?: {
      proxy_type?: string;
      asn?: string;
      as_name?: string;
      isp_name?: string;
      ip_country_code?: string;
      ip_country_name?: string;
      ip_city?: string;
      ip_district_name?: string;
    };
    maxmind_geolite2?: {
      ip_country_name?: string;
      ip_country_code?: string;
      ip_city?: string;
      ip_state_name?: string;
      asn?: string;
      as_name?: string;
    };
    x4bnet?: {
      is_tor?: boolean;
    };
  };
}

const PREMIUM_PLACEHOLDER = 'PREMIUM FIELD - upgrade to view';

function cleanPremiumField(value?: string): string {
  if (!value || value === PREMIUM_PLACEHOLDER) return '';
  return fixUtf8Mojibake(value);
}

function cleanLocationField(value?: string): string {
  if (!value) return '';
  return fixUtf8Mojibake(value);
}

function getScamalyticsConfig() {
  const host = process.env.SCAMALYTICS_API_HOST?.replace(/\/$/, '');
  const username = process.env.SCAMALYTICS_USERNAME;
  const apiKey = process.env.SCAMALYTICS_API_KEY;

  if (!host || !username || !apiKey) {
    throw new Error('Scamalytics API is not configured.');
  }

  return { host, username, apiKey };
}

export async function checkIpWithScamalytics(ip: string): Promise<ScamalyticsResult> {
  const { host, username, apiKey } = getScamalyticsConfig();
  const url = `${host}/${username}?key=${encodeURIComponent(apiKey)}&ip=${encodeURIComponent(ip)}`;

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 0 },
  });

  const data = (await res.json()) as ScamalyticsApiResponse;
  const scam = data.scamalytics;

  if (!res.ok || !scam || scam.status === 'error') {
    throw new Error(scam?.error || `Scamalytics request failed (${res.status})`);
  }

  const lite = data.external_datasources?.ip2proxy_lite;
  const maxmind = data.external_datasources?.maxmind_geolite2;
  const x4bnet = data.external_datasources?.x4bnet;

  const proxyType = lite?.proxy_type && lite.proxy_type !== '0' ? lite.proxy_type : 'None';
  const countryCode = lite?.ip_country_code || maxmind?.ip_country_code || '';
  const rawCountry = lite?.ip_country_name || maxmind?.ip_country_name || '';
  const country = countryCode
    ? getCountryName(countryCode) || cleanLocationField(rawCountry) || 'Unknown'
    : cleanLocationField(rawCountry) || 'Unknown';
  const city = cleanLocationField(lite?.ip_city || maxmind?.ip_city) || 'Unknown';
  const region = cleanLocationField(lite?.ip_district_name || maxmind?.ip_state_name);

  return {
    ip: scam.ip || ip,
    score: scam.scamalytics_score ?? 0,
    risk: scam.scamalytics_risk || 'unknown',
    ispRisk: scam.scamalytics_isp_risk || 'unknown',
    ispScore: scam.scamalytics_isp_score ?? 0,
    reportUrl: scam.scamalytics_url || `https://scamalytics.com/ip/${ip}`,
    proxy: scam.scamalytics_proxy || {
      is_datacenter: false,
      is_vpn: false,
      is_apple_icloud_private_relay: false,
      is_amazon_aws: false,
      is_google: false,
    },
    isBlacklisted: scam.is_blacklisted_external ?? false,
    isTor: x4bnet?.is_tor ?? false,
    proxyType,
    location: {
      country,
      countryCode,
      city,
      region: region === city ? '' : region,
    },
    isp: cleanPremiumField(scam.scamalytics_isp) || lite?.isp_name || lite?.as_name || maxmind?.as_name || 'Unknown',
    org: cleanPremiumField(scam.scamalytics_org) || lite?.as_name || maxmind?.as_name || '',
    asn: lite?.asn || maxmind?.asn || '',
    mode: scam.mode || 'live',
  };
}

export function isValidIp(ip: string): boolean {
  const ipv4 =
    /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
  const ipv6 =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
  return ipv4.test(ip) || ipv6.test(ip);
}
