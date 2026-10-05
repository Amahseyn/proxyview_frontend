import ProxyCheckerPageContent from './ProxyCheckerPageContent';

export default function ProxyCheckerForm() {
  return (
    <>
      <div className="page-hero page-hero--compact">
        <div className="container">
          <h1>IP Checker</h1>
          <p>
            Test any IP for VPN, datacenter, TOR, and fraud risk signals before you route traffic through it.
          </p>
        </div>
      </div>

      <section className="proxy-checker-page">
        <div className="container">
          <ProxyCheckerPageContent />
        </div>
      </section>
    </>
  );
}
