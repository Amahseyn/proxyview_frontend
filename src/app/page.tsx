import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import NewsSection from '@/components/NewsSection';
import ReviewLab from '@/components/ReviewLab';
import AntiDetectSection from '@/components/AntiDetectSection';

export const metadata: Metadata = {
  title: 'Home — ProxyView',
  description: 'Find the Best Proxy Providers for Your Use Case. We run unbiased, hands-on tests across leading proxy and anti-detect solutions.',
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutSection />
      <NewsSection />
      <ReviewLab />
      <AntiDetectSection />
    </>
  );
}
