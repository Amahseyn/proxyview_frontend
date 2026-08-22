import type { Metadata } from 'next';
import FaqList from './FaqList';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions — ProxyView',
  description: 'Everything you need to know about proxies, anti-detect tools, and ProxyView.',
};

export default function FaqPage() {
  return <FaqList />;
}
