export type IpUsageType = 'Residential' | 'Mobile' | 'Datacenter' | 'ISP';

export type IpUsageTypeSource = 'detected' | 'estimated';

export interface IpSecuritySignals {
  mobile?: boolean;
  hosting?: boolean;
}

const DATACENTER_RE =
  /\b(hosting|hostkey|datacenter|data\s*center|cloud|server|vps|dedicated|colocation|amazon|aws|google\b|google\s*cloud|microsoft|azure|digitalocean|linode|vultr|hetzner|ovh|contabo|leaseweb|akamai|fastly|cloudflare|equinix|psychz|choopa|m247|ionos|godaddy|rackspace)\b/i;

const MOBILE_RE =
  /\b(mobile|wireless|cellular|t-mobile|vodafone|o2|telefonica|orange|ee\s|three\s|mtn\b|airtel|jio\b|reliance\s+jio|at&t\s+mobility|verizon\s+wireless|sprint)\b/i;

const BUSINESS_ISP_RE =
  /\b(cogent|zayo|lumen|hurricane|he\.net|ntt\b|telia|tata\s+communications|level\s*3|gtt\b|pccw|telstra\s+international|liberty\s+global)\b/i;

const RESIDENTIAL_ISP_RE =
  /\b(comcast|xfinity|spectrum|charter|cox\s+communications|virgin\s+media|bt\s+group|sky\s+broadband|talktalk|frontier\s+communications|centurylink|windstream|optimum|mediacom|residential|broadband|fiber|fios|dsl|cablevision|ziggo|kpn\b|proximus|swisscom|rogers\s+cable|bell\s+canada|telus\s+communications)\b/i;

function haystack(isp: string, org: string, domain: string): string {
  return `${isp} ${org} ${domain}`.toLowerCase();
}

export function classifyIpUsageType(
  isp: string,
  org: string,
  domain: string,
  security?: IpSecuritySignals | null
): { usageType: IpUsageType; source: IpUsageTypeSource } {
  if (security?.mobile) {
    return { usageType: 'Mobile', source: 'detected' };
  }
  if (security?.hosting) {
    return { usageType: 'Datacenter', source: 'detected' };
  }

  const text = haystack(isp, org, domain);

  if (DATACENTER_RE.test(text)) {
    return { usageType: 'Datacenter', source: 'estimated' };
  }
  if (MOBILE_RE.test(text)) {
    return { usageType: 'Mobile', source: 'estimated' };
  }
  if (BUSINESS_ISP_RE.test(text)) {
    return { usageType: 'ISP', source: 'estimated' };
  }
  if (RESIDENTIAL_ISP_RE.test(text)) {
    return { usageType: 'Residential', source: 'estimated' };
  }

  const ispish = /\b(isp|internet|telecom|telecommunications|communications|network)\b/i.test(text);
  if (ispish) {
    return { usageType: 'ISP', source: 'estimated' };
  }

  return { usageType: 'Residential', source: 'estimated' };
}
