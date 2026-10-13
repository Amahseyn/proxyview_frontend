'use client';

import { useProxyChecker } from '@/hooks/useProxyChecker';
import {
  ProxyCheckerFormFields,
  ProxyCheckerResults,
  useClientInfo,
} from '@/components/proxy-checker/ProxyCheckerParts';

type Props = {
  idPrefix?: string;
  compact?: boolean;
};

export default function ProxyCheckerWidget({ idPrefix = 'proxy', compact = false }: Props) {
  const { ip, setIp, status, message, result, checkIp, checkMyIp } = useProxyChecker();
  const clientInfo = useClientInfo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkIp(ip);
  };

  return (
    <div className={`proxy-checker-widget${compact ? ' proxy-checker-widget--compact' : ''}`}>
      <ProxyCheckerFormFields
        idPrefix={idPrefix}
        compact={compact}
        ip={ip}
        status={status}
        message={message}
        onIpChange={setIp}
        onSubmit={handleSubmit}
        onCheckMyIp={checkMyIp}
      />

      {status === 'loading' && (
        <div className="ip-checker-loading" aria-live="polite">
          <span className="ip-checker-loading-dot" />
          Looking up…
        </div>
      )}

      {result && status === 'success' && clientInfo && (
        <ProxyCheckerResults result={result} client={clientInfo} />
      )}
    </div>
  );
}
