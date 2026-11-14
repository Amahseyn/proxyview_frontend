import type { Metadata } from 'next';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us',
  alternates: { canonical: '/contact_us' },
  description: 'Get in touch with the ProxyView team for questions, partnership inquiries, or feedback.',
};

export default function ContactPage() {
  return <ContactForm />;
}
