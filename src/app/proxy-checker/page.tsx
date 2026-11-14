import type { Metadata } from 'next';
import ProxyCheckerForm from './ProxyCheckerForm';

export const metadata: Metadata = {
  title: 'IP Checker',
  alternates: { canonical: '/proxy-checker' },
  description:
    'Check country, ISP, and time zone for any IP address—free on ProxyView.',
};

export default function ProxyCheckerPage() {
  return <ProxyCheckerForm />;
}
