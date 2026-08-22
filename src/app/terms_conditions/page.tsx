import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions — ProxyView',
  description: 'ProxyView terms and conditions — rules governing the use of our website.',
};

export default function TermsPage() {
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>Terms and Conditions</h1>
          <p>Last updated: September 2025</p>
        </div>
      </div>
      <section className="legal-page section">
        <div className="container">
          <div className="legal-inner">
            <p>
              By accessing and using ProxyView (proxyview.net), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our website.
            </p>

            <h2>Use of the Website</h2>
            <p>
              ProxyView is an informational resource providing proxy provider reviews, comparisons, and guides. The content is intended for informational purposes only and does not constitute professional advice.
            </p>
            <p>You agree not to:</p>
            <ul>
              <li>Use the website for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the website</li>
              <li>Scrape or harvest content without our written permission</li>
              <li>Reproduce or distribute our content without attribution and permission</li>
              <li>Use our content in a misleading or deceptive manner</li>
            </ul>

            <h2>Intellectual Property</h2>
            <p>
              All content on ProxyView, including text, graphics, logos, and reviews, is the property of ProxyView and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
            </p>

            <h2>Affiliate Disclosure</h2>
            <p>
              ProxyView participates in affiliate programs. Some links on our website are affiliate links, which means we may earn a commission if you make a purchase through those links. This does not affect our editorial independence — we only recommend services we have genuinely tested and evaluated.
            </p>

            <h2>Editorial Independence</h2>
            <p>
              Our reviews and rankings are based solely on our independent testing and analysis. We do not accept payment for favorable reviews or rankings. Affiliate relationships do not influence our editorial opinions.
            </p>

            <h2>Disclaimer of Warranties</h2>
            <p>
              The information on ProxyView is provided "as is" without any representations or warranties, express or implied. We make no representations or warranties regarding the accuracy, completeness, or reliability of any content on our website.
            </p>
            <p>
              Proxy providers' features, pricing, and availability change frequently. Always verify current information directly with the provider before making a purchasing decision.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, ProxyView shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use our website or its content.
            </p>

            <h2>Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. These links are provided for convenience only. We have no control over the content of those sites and accept no responsibility for them or for any loss or damage that may arise from your use of them.
            </p>

            <h2>Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms and Conditions at any time. Continued use of the website after any changes constitutes acceptance of the new terms.
            </p>

            <h2>Governing Law</h2>
            <p>
              These Terms and Conditions are governed by and construed in accordance with applicable law. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the competent courts.
            </p>

            <h2>Contact</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at hello@proxyview.net.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
