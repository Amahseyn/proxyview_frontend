'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import type { IpWhoResult } from '@/lib/ipwho';
import type { IpUsageType } from '@/lib/ipUsageType';
import {
  type ClientInfo,
  countryCodeToEmoji,
  countryFlagUrl,
  getClientInfo,
} from '@/lib/clientInfo';
import { formatLocationLine } from '@/lib/textEncoding';
import type { CheckerStatus } from '@/hooks/useProxyChecker';

function CountryFlag({
  code,
  country,
  flagImg,
}: {
  code: string;
  country: string;
  flagImg?: string;
}) {
  const flagUrl = flagImg || countryFlagUrl(code, 80);
  const emoji = countryCodeToEmoji(code);

  if (flagUrl) {
    return (
      <div className="ip-flag">
        <Image
          src={flagUrl}
          alt=""
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

function formatTimezone(result: IpWhoResult): string {
  const { timezone } = result;
  if (timezone.id && timezone.utc) {
    return `${timezone.id.replace(/_/g, ' ')} · UTC${timezone.utc}`;
  }
  if (timezone.id) {
    return timezone.id.replace(/_/g, ' ');
  }
  if (timezone.abbr) {
    return timezone.abbr;
  }
  return '—';
}

function usageTypeClass(type: IpUsageType): string {
  return type.toLowerCase();
}

function UsageTypeBadge({ result }: { result: IpWhoResult }) {
  const hint =
    result.usageTypeSource === 'estimated'
      ? 'Estimated from ISP and network name (ipwho.is free tier has no threat signals).'
      : 'From ipwho.is network classification.';

  return (
    <span
      className={`ip-checker-type ip-checker-type--${usageTypeClass(result.usageType)}`}
      title={hint}
    >
      {result.usageType}
    </span>
  );
}

function CopyIpButton({ ip }: { ip: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(ip);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [ip]);

  return (
    <button type="button" className="ip-checker-copy" onClick={copy}>
      {copied ? 'Copied' : 'Copy IP'}
    </button>
  );
}

export function ProxyCheckerResults({
  result,
  client,
  layout = 'compact',
}: {
  result: IpWhoResult;
  client: ClientInfo;
  layout?: 'page' | 'compact';
}) {
  const locationLine = formatLocationLine(result.city, result.region, result.country);
  const asn = result.connection.asn > 0 ? `AS${result.connection.asn}` : '';
  const network =
    result.connection.org && result.connection.org !== result.connection.isp
      ? result.connection.org
      : '';
  const browserLabel = client.browserVersion
    ? `${client.browser} ${client.browserVersion}`
    : client.browser;

  return (
    <div
      className={`ip-checker-output${layout === 'page' ? ' ip-checker-output--page' : ''}`}
      aria-live="polite"
    >
      <div className="ip-checker-output-hero">
        <CountryFlag
          code={result.countryCode}
          country={result.country}
          flagImg={result.flagImg}
        />
        <div className="ip-checker-output-main">
          <div className="ip-checker-output-ip-row">
            <h3 className="ip-checker-output-ip">{result.ip}</h3>
            <CopyIpButton ip={result.ip} />
          </div>
          {locationLine && (
            <p className="ip-checker-output-location">{locationLine}</p>
          )}
        </div>
      </div>

      <dl className="ip-checker-facts">
        <div>
          <dt>IP type</dt>
          <dd>
            <UsageTypeBadge result={result} />
          </dd>
        </div>
        <div>
          <dt>Your browser</dt>
          <dd>{browserLabel}</dd>
        </div>
        <div>
          <dt>Your OS</dt>
          <dd>{client.os}</dd>
        </div>
        <div>
          <dt>ISP</dt>
          <dd>{result.connection.isp}</dd>
        </div>
        {network && (
          <div>
            <dt>Network</dt>
            <dd>{network}</dd>
          </div>
        )}
        {asn && (
          <div>
            <dt>ASN</dt>
            <dd>{asn}</dd>
          </div>
        )}
        <div>
          <dt>Time zone</dt>
          <dd>{formatTimezone(result)}</dd>
        </div>
      </dl>
    </div>
  );
}

type FormProps = {
  idPrefix?: string;
  compact?: boolean;
  layout?: 'default' | 'page';
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
  layout = 'default',
  ip,
  status,
  message,
  onIpChange,
  onSubmit,
  onCheckMyIp,
}: FormProps) {
  const inputId = `${idPrefix}-ip`;
  const isInline = compact || layout === 'page';

  return (
    <form
      onSubmit={onSubmit}
      className={`ip-checker-form${isInline ? ' ip-checker-form-inline' : ''}${layout === 'page' ? ' ip-checker-form--page' : ''}`}
    >
      <div className="form-group ip-checker-input-wrap">
        <label htmlFor={inputId} className={layout === 'page' ? 'visually-hidden' : undefined}>
          IP address
        </label>
        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          placeholder="Enter an IP (e.g. 8.8.8.8)"
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
