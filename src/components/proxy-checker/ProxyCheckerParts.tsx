'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { ScamalyticsResult } from '@/lib/scamalytics';
import {
  type ClientInfo,
  countryCodeToEmoji,
  countryFlagUrl,
  getClientInfo,
} from '@/lib/clientInfo';
import { formatLocationLine } from '@/lib/textEncoding';
import type { CheckerStatus } from '@/hooks/useProxyChecker';

function riskClass(risk: string): string {
  const normalized = risk.toLowerCase().replace(/\s+/g, '-');
  if (normalized === 'very-high') return 'risk-very-high';
  if (normalized === 'high') return 'risk-high';
  if (normalized === 'medium') return 'risk-medium';
  return 'risk-low';
}

function formatRisk(risk: string): string {
  return risk.replace(/\b\w/g, (char) => char.toUpperCase());
}

function CountryFlag({ code, country }: { code: string; country: string }) {
  const flagUrl = countryFlagUrl(code, 80);
  const emoji = countryCodeToEmoji(code);

  if (flagUrl) {
    return (
      <div className="ip-flag">
        <Image
          src={flagUrl}
          alt={`${country} flag`}
          width={56}
          height={42}
          unoptimized
          className="ip-flag-img"
        />
      </div>
    );
  }

  return <span className="ip-flag-emoji" aria-hidden="true">{emoji}</span>;
}

function FlagRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className={`proxy-flag ${value ? 'proxy-flag-yes' : 'proxy-flag-no'}`}>
      <span className="proxy-flag-label">{label}</span>
      <span className="proxy-flag-value">{value ? 'Yes' : 'No'}</span>
    </div>
  );
}

export function ClientEnvironment({ client }: { client: ClientInfo }) {
  const browserLabel = client.browserVersion
    ? `${client.browser} ${client.browserVersion}`
    : client.browser;

  return (
    <div className="ip-client-env">
      <h4>Your Navigator &amp; Platform</h4>
      <div className="ip-client-grid">
        <div className="ip-client-item">
          <span className="ip-client-label">Browser</span>
          <span className="ip-client-value">{browserLabel}</span>
        </div>
        <div className="ip-client-item">
          <span className="ip-client-label">Operating System</span>
          <span className="ip-client-value">{client.os}</span>
        </div>
        <div className="ip-client-item">
          <span className="ip-client-label">Platform</span>
          <span className="ip-client-value">{client.platform}</span>
        </div>
        <div className="ip-client-item">
          <span className="ip-client-label">Language</span>
          <span className="ip-client-value">{client.language}</span>
        </div>
        <div className="ip-client-item">
          <span className="ip-client-label">Device</span>
          <span className="ip-client-value">{client.mobile ? 'Mobile' : 'Desktop'}</span>
        </div>
      </div>
    </div>
  );
}

export function ProxyCheckerResults({
  result,
  client,
}: {
  result: ScamalyticsResult;
  client: ClientInfo;
}) {
  const isProxy =
    result.proxy.is_vpn ||
    result.proxy.is_datacenter ||
    result.isTor ||
    result.proxyType !== 'None' ||
    result.proxy.is_apple_icloud_private_relay;

  const locationLine = formatLocationLine(
    result.location.city,
    result.location.region,
    result.location.country,
  );

  return (
    <div className="proxy-results ip-results-panel ip-results-panel--page">
      <div className="ip-results-section-head">
        <h2>Results</h2>
        <p>Full breakdown for the checked IP address.</p>
      </div>

      <div className="ip-results-hero">
        <div className="ip-results-hero-main">
          <CountryFlag code={result.location.countryCode} country={result.location.country} />
          <div>
            <p className="ip-results-label">Checked IP</p>
            <h3 className="ip-results-ip">{result.ip}</h3>
            <p className="proxy-results-subtitle">
              {locationLine}
              {result.location.countryCode ? ` · ${result.location.countryCode}` : ''}
            </p>
          </div>
        </div>
        <div className={`proxy-risk-badge ip-risk-badge ${riskClass(result.risk)}`}>
          <span className="proxy-risk-score">{result.score}</span>
          <span className="proxy-risk-label">{formatRisk(result.risk)} Risk</span>
        </div>
      </div>

      <ClientEnvironment client={client} />

      <div className="ip-results-grid">
        <div className="proxy-result-card ip-result-card">
          <h4>Location</h4>
          <dl>
            <div>
              <dt>Country</dt>
              <dd className="ip-country-value">
                {result.location.countryCode && (
                  <span className="ip-country-flag-inline" aria-hidden="true">
                    {countryCodeToEmoji(result.location.countryCode)}
                  </span>
                )}
                {result.location.country}
              </dd>
            </div>
            <div>
              <dt>City</dt>
              <dd>{result.location.city}</dd>
            </div>
            {result.location.region && (
              <div>
                <dt>Region</dt>
                <dd>{result.location.region}</dd>
              </div>
            )}
            {result.location.countryCode && (
              <div>
                <dt>Country Code</dt>
                <dd>{result.location.countryCode}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="proxy-result-card ip-result-card">
          <h4>Network</h4>
          <dl>
            <div>
              <dt>ISP</dt>
              <dd>{result.isp}</dd>
            </div>
            {result.org && (
              <div>
                <dt>Organization</dt>
                <dd>{result.org}</dd>
              </div>
            )}
            {result.asn && (
              <div>
                <dt>ASN</dt>
                <dd>{result.asn}</dd>
              </div>
            )}
            <div>
              <dt>Proxy Type</dt>
              <dd>{result.proxyType}</dd>
            </div>
            <div>
              <dt>ISP Risk</dt>
              <dd className={riskClass(result.ispRisk)}>
                {formatRisk(result.ispRisk)} ({result.ispScore})
              </dd>
            </div>
          </dl>
        </div>

        <div className="proxy-result-card ip-result-card ip-result-card--wide">
          <h4>Proxy &amp; Anonymity</h4>
          <div className="proxy-flags ip-proxy-flags">
            <FlagRow label="VPN" value={result.proxy.is_vpn} />
            <FlagRow label="Datacenter" value={result.proxy.is_datacenter} />
            <FlagRow label="TOR" value={result.isTor} />
            <FlagRow label="Public Proxy" value={result.proxyType === 'PUB'} />
            <FlagRow label="iCloud Private Relay" value={result.proxy.is_apple_icloud_private_relay} />
            <FlagRow label="Amazon AWS" value={result.proxy.is_amazon_aws} />
            <FlagRow label="Google" value={result.proxy.is_google} />
            <FlagRow label="Blacklisted" value={result.isBlacklisted} />
          </div>
          <p className={`proxy-verdict ${isProxy ? 'proxy-verdict-warning' : 'proxy-verdict-clean'}`}>
            {isProxy
              ? 'This IP shows proxy or anonymization signals.'
              : 'No strong proxy signals detected for this IP.'}
          </p>
        </div>
      </div>
    </div>
  );
}

type FormProps = {
  idPrefix?: string;
  compact?: boolean;
  ip: string;
  status: CheckerStatus;
  message: string;
  onIpChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCheckMyIp: () => void;
};

export function ProxyCheckerFormFields({
  idPrefix = 'proxy',
  compact = false,
  ip,
  status,
  message,
  onIpChange,
  onSubmit,
  onCheckMyIp,
}: FormProps) {
  const inputId = `${idPrefix}-ip`;

  return (
    <form
      onSubmit={onSubmit}
      className={`ip-checker-form${compact ? ' ip-checker-form-inline' : ''}`}
    >
      <div className="form-group ip-checker-input-wrap">
        <label htmlFor={inputId}>IP Address</label>
        <input
          id={inputId}
          type="text"
          placeholder="e.g. 8.8.8.8"
          value={ip}
          onChange={(e) => onIpChange(e.target.value)}
          className="ip-checker-input"
        />
      </div>
      <div className="proxy-checker-actions">
        <button type="submit" className="btn btn-primary form-submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Checking…' : 'Check IP'}
        </button>
        <button
          type="button"
          className="btn btn-outline proxy-check-my-ip"
          onClick={onCheckMyIp}
          disabled={status === 'loading'}
        >
          Check My IP
        </button>
      </div>
      {status === 'error' && <div className="form-error">✕ {message}</div>}
    </form>
  );
}

export function useClientInfo() {
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);

  useEffect(() => {
    setClientInfo(getClientInfo());
  }, []);

  return clientInfo;
}
