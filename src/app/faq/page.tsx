import type { Metadata } from 'next';
import FaqList from './FaqList';
import JsonLd from '@/components/seo/JsonLd';
import { FAQ_ITEMS } from '@/lib/data/faqs';
import { buildFaqPageJsonLd } from '@/lib/seo/jsonLd';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  alternates: { canonical: '/faq' },
  description: 'Everything you need to know about proxies, anti-detect tools, and ProxyView.',
};

export default function FaqPage() {
  return (
    <>
      <JsonLd data={buildFaqPageJsonLd(FAQ_ITEMS)} />
      <FaqList />
    </>
  );
}
