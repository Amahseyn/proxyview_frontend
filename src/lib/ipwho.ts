import { classifyIpUsageType, type IpUsageType, type IpUsageTypeSource } from '@/lib/ipUsageType';
import { fixUtf8Mojibake } from '@/lib/textEncoding';

export interface IpWhoResult {
  ip: string;
  type: string;
  continent: string;
  continentCode: string;
  country: string;
  countryCode: string;
  region: string;
  regionCode: string;
  city: string;
  latitude: number;
  longitude: number;
  postal: string;
  callingCode: string;
  capital: string;
  borders: string;
  isEu: boolean;
  flagImg: string;
  connection: {
    asn: number;
    org: string;
    isp: string;
    domain: string;
  };
  timezone: {
    id: string;
    abbr: string;
    isDst: boolean;
    offset: number;
    utc: string;
  };
  usageType: IpUsageType;
  usageTypeSource: IpUsageTypeSource;
}

interface IpWhoApiResponse {
  success: boolean;
  message?: string;
  ip?: string;
  type?: string;
  continent?: string;
  continent_code?: string;
  country?: string;
  country_code?: string;
  region?: string;
  region_code?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  postal?: string;
  calling_code?: string;
  capital?: string;
  borders?: string;
  is_eu?: boolean;
  flag?: { img?: string };
  connection?: {
    asn?: number;
    org?: string;
    isp?: string;
    domain?: string;
  };
  timezone?: {
    id?: string;
    abbr?: string;
    is_dst?: boolean;
    offset?: number;
    utc?: string;
  };
  security?: {
    mobile?: boolean;
    hosting?: boolean;
  };
}

function cleanField(value?: string): string {
  if (!value) return '';
  return fixUtf8Mojibake(value);
}

export async function checkIpWithIpWho(ip: string): Promise<IpWhoResult> {
  const url = `http://ipwho.is/${encodeURIComponent(ip)}?security=1`;

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 0 },
  });

  const data = (await res.json()) as IpWhoApiResponse;

  if (!res.ok || !data.success) {
    throw new Error(data.message || `IP lookup failed (${res.status})`);
  }

  const connection = data.connection ?? {};
  const isp = cleanField(connection.isp) || 'Unknown';
  const org = cleanField(connection.org);
  const domain = connection.domain || '';
  const { usageType, source: usageTypeSource } = classifyIpUsageType(
    isp,
    org,
    domain,
    data.security
  );

  return {
    ip: data.ip || ip,
    type: data.type || 'Unknown',
    continent: cleanField(data.continent) || 'Unknown',
    continentCode: data.continent_code || '',
    country: cleanField(data.country) || 'Unknown',
    countryCode: data.country_code || '',
    region: cleanField(data.region),
    regionCode: data.region_code || '',
    city: cleanField(data.city) || 'Unknown',
    latitude: data.latitude ?? 0,
    longitude: data.longitude ?? 0,
    postal: data.postal || '',
    callingCode: data.calling_code || '',
    capital: cleanField(data.capital),
    borders: data.borders || '',
    isEu: data.is_eu ?? false,
    flagImg: data.flag?.img || '',
    connection: {
      asn: connection.asn ?? 0,
      org,
      isp,
      domain,
    },
    timezone: {
      id: data.timezone?.id || '',
      abbr: data.timezone?.abbr || '',
      isDst: data.timezone?.is_dst ?? false,
      offset: data.timezone?.offset ?? 0,
      utc: data.timezone?.utc || '',
    },
    usageType,
    usageTypeSource,
  };
}

export function isValidIp(ip: string): boolean {
  const ipv4 =
    /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
  const ipv6 =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
  return ipv4.test(ip) || ipv6.test(ip);
}
