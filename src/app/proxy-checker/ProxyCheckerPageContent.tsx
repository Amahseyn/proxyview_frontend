'use client';

import { useProxyChecker } from '@/hooks/useProxyChecker';
import {
  ProxyCheckerFormFields,
  ProxyCheckerResults,
  useClientInfo,
} from '@/components/proxy-checker/ProxyCheckerParts';

export default function ProxyCheckerPageContent() {
  const { ip, setIp, status, message, result, checkIp, checkMyIp } = useProxyChecker();
  const clientInfo = useClientInfo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkIp(ip);
  };

  const showPlaceholder = status !== 'loading' && !result;

  return (
    <div className="ip-checker-page">
      <div className="ip-checker-tool-card contact-form-card">
        <ProxyCheckerFormFields
          idPrefix="proxy-page"
          layout="page"
          ip={ip}
          status={status}
          message={message}
          onIpChange={setIp}
          onSubmit={handleSubmit}
          onCheckMyIp={checkMyIp}
        />

        {status === 'loading' && (
          <div className="ip-checker-loading ip-checker-loading--panel" aria-live="polite">
            <span className="ip-checker-loading-dot" />
            Looking up this IP…
          </div>
        )}

        {result && status === 'success' && clientInfo && (
          <ProxyCheckerResults result={result} client={clientInfo} layout="page" />
        )}

        {showPlaceholder && (
          <div className="ip-checker-placeholder" aria-hidden={!!result}>
            <p className="ip-checker-placeholder-title">No lookup yet</p>
            <p className="ip-checker-placeholder-text">
              Enter an IP address or use <strong>Check My IP</strong> to see country, ISP, and time
              zone.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
