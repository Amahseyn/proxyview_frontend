import type { Metadata } from 'next';
import { getGlossaryPageContent } from '@/lib/glossary.server';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { config } = await getGlossaryPageContent();

  return {
    title: `${config.heroTitle} — ProxyView`,
    description: config.heroSubtitle,
    alternates: {
      canonical: '/glossary',
    },
  };
}

export default async function GlossaryPage() {
  const { config, terms } = await getGlossaryPageContent();

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>{config.heroTitle}</h1>
          <p>{config.heroSubtitle}</p>
        </div>
      </div>
      <section className="glossary-page section">
        <div className="container">
          <div className="glossary-inner">
            {terms.length === 0 ? (
              <p>No glossary terms have been published yet.</p>
            ) : (
              terms.map(item => (
                <div key={item.id} className="glossary-term">
                  <h3>{item.term}</h3>
                  <p>{item.definition}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
