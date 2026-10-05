'use client';

import { useProxyChecker } from '@/hooks/useProxyChecker';
import {
  ClientEnvironment,
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

      {clientInfo && status === 'idle' && !result && (
        <ClientEnvironment client={clientInfo} />
      )}

      {result && clientInfo && <ProxyCheckerResults result={result} client={clientInfo} />}
    </div>
  );
}
