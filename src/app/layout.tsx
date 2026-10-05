import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JsonLd from '@/components/seo/JsonLd';
import { fontVariables } from '@/lib/fonts';
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from '@/lib/seo/jsonLd';
import { getAbsoluteSiteUrl } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(getAbsoluteSiteUrl()),
  title: { default: 'ProxyView', template: '%s | ProxyView' },
  description: 'Find the Best Proxy Providers for Your Use Case. Independent, unbiased proxy and anti-detect browser reviews based on real-world testing.',
  openGraph: {
    siteName: 'ProxyView',
    type: 'website',
    locale: 'en_US',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-FES8KHXD3M" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-FES8KHXD3M');
            `,
          }}
        />
      </head>
      <body>
        <JsonLd data={[buildOrganizationJsonLd(), buildWebSiteJsonLd()]} />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
