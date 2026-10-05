export const DEFAULT_GLOSSARY_HERO = {
  heroTitle: 'Proxy Glossary',
  heroSubtitle: 'Key terms and definitions in the proxy, anti-detect, and web scraping industry.',
};

export const glossaryTerms = [
  { term: 'Proxy Server', definition: 'An intermediary server that routes your internet requests through its own IP address, hiding your real IP from the target server.' },
  { term: 'Residential Proxy', definition: 'A proxy that uses an IP address assigned by an ISP to a real home user. Highly authentic and difficult to detect as a proxy.' },
  { term: 'Datacenter Proxy', definition: 'A proxy hosted in a cloud data center. Fast and affordable, but more easily detected by anti-bot systems due to known datacenter IP ranges.' },
  { term: 'Mobile Proxy', definition: 'A proxy that routes traffic through real mobile devices on 3G/4G/5G networks. Carries the highest trust score among proxy types.' },
  { term: 'Rotating Proxy', definition: 'A proxy setup where the IP address changes automatically on each request or at set intervals, reducing the risk of detection and blocking.' },
  { term: 'Sticky Session', definition: 'A proxy configuration that keeps the same IP address for a defined period, useful for maintaining sessions on websites that track IP consistency.' },
  { term: 'SOCKS5 Proxy', definition: 'A versatile proxy protocol that supports TCP and UDP traffic. More flexible than HTTP proxies and works with a wider range of applications.' },
  { term: 'HTTP Proxy', definition: 'A proxy that handles HTTP/HTTPS web traffic. The most common type for web scraping and browsing.' },
  { term: 'Anti-Detect Browser', definition: 'A browser that allows you to create isolated profiles with unique fingerprints, preventing websites from linking multiple sessions to the same identity.' },
  { term: 'Browser Fingerprint', definition: 'A unique set of browser characteristics (user agent, screen size, fonts, canvas, WebGL, etc.) that websites use to identify and track users.' },
  { term: 'IP Ban', definition: 'When a website blocks access from a specific IP address, typically triggered by suspicious activity, rate limit violations, or policy violations.' },
  { term: 'Rate Limiting', definition: 'A server-side mechanism that restricts the number of requests from a single IP within a time window, used to prevent scraping and abuse.' },
  { term: 'robots.txt', definition: 'A standard file that websites use to communicate crawling rules to bots. Ethical scrapers should always check and respect robots.txt directives.' },
  { term: 'CAPTCHA', definition: 'A challenge-response test used to distinguish humans from bots. Common CAPTCHAs include reCAPTCHA v2/v3, hCaptcha, and image-based puzzles.' },
  { term: 'Web Scraping', definition: 'The automated extraction of data from websites, typically by parsing HTML or interacting with web pages programmatically.' },
  { term: 'Headless Browser', definition: 'A web browser that runs without a graphical interface. Used in automation and scraping to render JavaScript-heavy pages.' },
  { term: 'IP Pool', definition: 'A collection of IP addresses managed by a proxy provider, used to rotate requests and distribute traffic to avoid detection.' },
  { term: 'Geo-targeting', definition: 'The ability to route requests through proxies in specific countries or cities to access geo-restricted content or verify localized ads.' },
];
