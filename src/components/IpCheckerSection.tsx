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
              See country, ISP, and time zone for any address—handy when you are testing a proxy.
            </p>
            <ul className="proxy-checker-tips">
              <li>Compare your real IP with your proxy IP.</li>
              <li>Check that the location matches your provider.</li>
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
