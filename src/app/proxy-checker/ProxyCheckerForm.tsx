import ProxyCheckerPageContent from './ProxyCheckerPageContent';

export default function ProxyCheckerForm() {
  return (
    <>
      <div className="page-hero page-hero--compact">
        <div className="container">
          <h1>IP Checker</h1>
          <p>Confirm where an IP appears to be and who hosts it—before you trust a proxy.</p>
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
