import type { Metadata } from 'next';
import { SITE_EMAIL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy — ProxyView',
  description: 'ProxyView privacy policy — how we collect, use, and protect your data.',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>Privacy Policy</h1>
          <p>Last updated: September 2025</p>
        </div>
      </div>
      <section className="legal-page section">
        <div className="container">
          <div className="legal-inner">
            <p>
              ProxyView ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit proxyview.net.
            </p>

            <h2>Information We Collect</h2>
            <h3>Information You Provide</h3>
            <p>When you contact us through our contact form, we collect your name, email address, and the content of your message. This information is used solely to respond to your inquiry.</p>

            <h3>Automatically Collected Information</h3>
            <p>When you visit our website, we may automatically collect certain information, including:</p>
            <ul>
              <li>IP address and general location</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent on each page</li>
              <li>Referring URLs</li>
              <li>Device type and operating system</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Improve our website content and user experience</li>
              <li>Analyze website traffic and usage patterns</li>
              <li>Maintain the security and integrity of our site</li>
            </ul>

            <h2>Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your experience on our website. You can control cookies through your browser settings. Note that disabling cookies may affect some website functionality.
            </p>

            <h2>Third-Party Services</h2>
            <p>
              We may use third-party analytics services (such as Google Analytics) to help us understand how visitors use our website. These services have their own privacy policies governing their use of your information.
            </p>
            <p>
              Some pages on ProxyView may contain affiliate links. If you click on an affiliate link and make a purchase, we may receive a commission. This does not affect our editorial independence or the price you pay.
            </p>

            <h2>Data Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required by law or as necessary to operate our website (e.g., hosting providers).
            </p>

            <h2>Data Retention</h2>
            <p>
              We retain contact form submissions for a maximum of 12 months, after which they are securely deleted. Analytics data is retained in accordance with the third-party provider's policies.
            </p>

            <h2>Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Lodge a complaint with a supervisory authority</li>
            </ul>
            <p>To exercise any of these rights, contact us at <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>.</p>

            <h2>Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the date at the top of this page.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
