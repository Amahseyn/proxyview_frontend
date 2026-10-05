import ProxyCheckerWidget from '@/components/ProxyCheckerWidget';

export default function IpCheckerSection() {
  return (
    <section className="ip-checker" aria-labelledby="ip-checker-heading">
      <div className="container">
        <div className="ip-checker-inner">
          <div className="ip-checker-info">
            <p className="ip-checker-label">Free Tool</p>
            <h2 id="ip-checker-heading">IP Checker</h2>
            <p className="ip-checker-desc">
              Verify any IP for VPN, datacenter, TOR, and fraud risk before you route traffic through a proxy.
            </p>
            <ul className="proxy-checker-tips">
              <li>Confirm your proxy IP differs from your real connection.</li>
              <li>Check that location matches what your provider promised.</li>
              <li>Spot datacenter or VPN flags that trigger blocks.</li>
            </ul>
          </div>

          <div className="ip-checker-panel contact-form-card">
            <ProxyCheckerWidget idPrefix="home-ip" compact />
          </div>
        </div>
      </div>
    </section>
  );
}
