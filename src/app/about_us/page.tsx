import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us — ProxyView',
  description: 'Learn about ProxyView — an independent proxy review and comparison platform built on real-world testing.',
};

const team = [
  {
    role: 'Research Analyst',
    description: 'Digs deep into proxy providers\' features, pricing models, legal terms, privacy policies, and user reputation. They flag what matters for real-world use and identify red flags early.',
  },
  {
    role: 'Technical Tester',
    description: 'Runs each tool through controlled tests, checking IP stability, rotation accuracy, speed, protocol support, and anti-detect resistance.',
  },
  {
    role: 'Writer',
    description: 'Translates raw data into readable insights. They organize findings into clear takeaways and explain technical concepts without jargon.',
  },
  {
    role: 'Fact-Checker',
    description: 'Verifies every claim, stat, and quote before anything goes live. Ensures ProxyView content is trustworthy and accurate.',
  },
];

export default function AboutPage() {
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>About ProxyView</h1>
          <p>Independent proxy reviews and comparisons you can trust.</p>
        </div>
      </div>
      <section className="about-page section">
        <div className="container">
          <div className="about-page-inner">
            <h2>Who We Are</h2>
            <p>
              ProxyView is an independent review platform dedicated to testing and comparing proxy providers and anti-detect browsers. We exist to help businesses, developers, and researchers make informed decisions without relying on biased vendor marketing.
            </p>
            <p>
              Every review on ProxyView is backed by real hands-on testing. We evaluate proxies on performance, reliability, detectability, protocol support, pricing fairness, and customer support quality.
            </p>

            <h2 style={{ marginTop: '48px' }}>Our Mission</h2>
            <p>
              Our mission is to be the most trusted independent resource for proxy and anti-detect browser comparisons. We focus on real-world use cases — web scraping, account management, ad verification, and market research — to give you actionable insights you can actually use.
            </p>

            <h2 style={{ marginTop: '48px' }}>The ProxyView Review Lab</h2>
            <p>
              Every review at ProxyView is a team effort built on real testing, critical analysis, and expert writing. Here's who makes it happen:
            </p>
            <div className="team-grid">
              {team.map((member, i) => (
                <div key={i} className="team-card">
                  <h3>{member.role}</h3>
                  <p>{member.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
