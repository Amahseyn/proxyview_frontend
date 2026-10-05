import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import NewsSection from '@/components/NewsSection';
import ReviewLab from '@/components/ReviewLab';
import AntiDetectSection from '@/components/AntiDetectSection';
import JsonLd from '@/components/seo/JsonLd';
import { buildWebPageJsonLd } from '@/lib/seo/jsonLd';

const HOME_DESCRIPTION =
  'Find the Best Proxy Providers for Your Use Case. We run unbiased, hands-on tests across leading proxy and anti-detect solutions.';

export const metadata: Metadata = {
  title: 'Home — ProxyView',
  description: HOME_DESCRIPTION,
};

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={buildWebPageJsonLd({
          name: 'Home — ProxyView',
          description: HOME_DESCRIPTION,
          path: '/',
        })}
      />
      <Hero />
      <AboutSection />
      <NewsSection />
      <ReviewLab />
      <AntiDetectSection />
    </>
  );
}
