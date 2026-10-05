import type { Metadata } from 'next';
import ProxyCheckerForm from './ProxyCheckerForm';

export const metadata: Metadata = {
  title: 'IP Checker — ProxyView',
  description:
    'Check any IP address for proxy, VPN, datacenter, and fraud risk signals in real time.',
};

export default function ProxyCheckerPage() {
  return <ProxyCheckerForm />;
}
