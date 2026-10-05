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

  return (
    <div className="proxy-checker-layout">
      <aside className="proxy-checker-sidebar">
        <div className="proxy-checker-block">
          <div className="proxy-checker-section-head">
            <h2>Check an IP Address</h2>
            <p>Enter any IP or instantly test your current connection.</p>
          </div>

          <ProxyCheckerFormFields
            idPrefix="proxy-page"
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
              Running IP analysis…
            </div>
          )}
        </div>

        <div className="proxy-checker-block proxy-checker-block--muted">
          <div className="proxy-checker-section-head">
            <h2>How It Works</h2>
            <p>
              Get fraud scores, proxy classification, location flags, and your browser
              environment in real time.
            </p>
          </div>

          <ul className="proxy-checker-tips">
            <li>Compare your real IP against your proxy IP to confirm it changed.</li>
            <li>Verify the country flag and city match what your provider promised.</li>
            <li>Review your navigator, OS, and platform while testing.</li>
            <li>Check VPN, datacenter, TOR, and blacklist signals before routing traffic.</li>
          </ul>
        </div>
      </aside>

      <div className="proxy-checker-results-col">
        {result && clientInfo ? (
          <ProxyCheckerResults result={result} client={clientInfo} />
        ) : (
          <div className="ip-results-empty">
            <h2>Results</h2>
            <p>Run a check to see IP details, risk score, and proxy signals here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
