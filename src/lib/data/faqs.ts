export type FaqItem = {
  question: string;
  answer: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is a proxy server?',
    answer:
      'A proxy server acts as an intermediary between your device and the internet. When you make a request through a proxy, it routes the traffic through its own IP address, masking your real IP and providing anonymity, geo-flexibility, and request distribution.',
  },
  {
    question: 'What is the difference between residential and datacenter proxies?',
    answer:
      'Residential proxies use IP addresses assigned by ISPs to real home devices, making them highly authentic and hard to detect. Datacenter proxies are hosted on cloud servers — they are faster and cheaper but more easily flagged by anti-bot systems.',
  },
  {
    question: 'What is an anti-detect browser?',
    answer:
      'An anti-detect browser is a specialized browser that allows you to create isolated browser profiles with unique fingerprints (user agent, canvas, WebGL, fonts, etc.). This prevents websites from linking multiple accounts or sessions to the same user.',
  },
  {
    question: 'How do I use proxies for web scraping?',
    answer:
      'Configure your scraping tool to route requests through a proxy or proxy pool. For best results, use rotating residential proxies, implement request delays, and mimic human browsing patterns to avoid detection and rate limiting.',
  },
  {
    question: 'Are proxies legal to use?',
    answer:
      'Using proxies is generally legal. However, you should always review the terms of service of the websites you access and comply with applicable laws. Scraping publicly available data is typically legal, but accessing private data or circumventing authentication is not.',
  },
  {
    question: 'What proxy type should I use for social media management?',
    answer:
      'For social media account management, residential or mobile proxies are strongly recommended. Social platforms use advanced bot detection, and datacenter IPs are frequently flagged. Each account should have its own dedicated IP to avoid cross-contamination.',
  },
  {
    question: 'How does ProxyView test proxy providers?',
    answer:
      'Our Technical Testers run each provider through a controlled benchmark covering IP stability, rotation accuracy, response speed, protocol support (HTTP/HTTPS/SOCKS5), and anti-detect resistance against real target websites. Results are compiled independently.',
  },
  {
    question: 'Does ProxyView accept sponsored reviews?',
    answer:
      'No. ProxyView does not accept payment for reviews or rankings. We may have affiliate relationships with some providers, but our editorial process is fully independent. We disclose any affiliate relationships clearly.',
  },
];
