// ProxyView API Client

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  thumbnail: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostInput {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  category?: string;
  author?: string;
  date?: string;
  thumbnail?: string;
}

export const DEFAULT_POSTS: Post[] = [
  {
    id: 1,
    slug: 'what-is-web-scraping',
    title: 'What is Web Scraping: A Clear Guide (Tools, API, Proxies)',
    excerpt: 'Web scraping is the automated collection of data from web pages and turning it into usable formats like CSV, JSON, or a database.',
    content: `<h2>What is Web Scraping?</h2><p>Web scraping is the automated collection of data from web pages and turning it into usable formats like CSV, JSON, or a database. It is widely used by businesses, researchers, and developers to gather large volumes of information quickly and efficiently.</p><p>Whether you need pricing data, news articles, product listings, or social media content, web scraping makes it possible to extract and structure this data programmatically.</p><h2>Why Use Proxies for Web Scraping?</h2><p>Proxies are an essential part of web scraping at scale. When you send too many requests from a single IP address, websites may block or rate-limit you. Proxies allow you to distribute your requests across multiple IP addresses, making your scraping activity harder to detect and block.</p><h2>Types of Web Scraping Tools</h2><p>Modern web scraping relies on a combination of HTTP clients, browser automation frameworks, and proxy networks. Popular tools include Python's requests and BeautifulSoup libraries, Playwright, Puppeteer, and Scrapy.</p>`,
    category: 'Guides',
    author: 'wm',
    date: 'September 14, 2025',
    thumbnail: '/images/Untitled-470-x-300-px-300x191.png',
  },
  {
    id: 2,
    slug: 'how-to-get-around-an-ip-ban',
    title: 'How To Get Around An IP Ban In 2025 (Safe And Effective Guide)',
    excerpt: "An IP ban happens when a website or platform blocks your device's IP address, cutting you off from access. It can stop you from browsing, joining communities, or logging into your favorite apps.",
    content: `<h2>How to Get Around an IP Ban</h2><p>An IP ban happens when a website or platform blocks your device's IP address, cutting you off from access. It can stop you from browsing, joining communities, or logging into your favorite apps. The good news is you don't have to stay locked out.</p><h2>Methods to Get Around an IP Ban</h2><p><strong>1. Use a Proxy Server</strong> &mdash; Route your traffic through a different IP address. Residential proxies are the hardest to detect.</p><p><strong>2. Use a VPN</strong> &mdash; A VPN changes your visible IP address and encrypts your traffic.</p><p><strong>3. Request a New IP from Your ISP</strong> &mdash; If you have a dynamic IP, simply reconnecting may give you a new address.</p>`,
    category: 'Guides',
    author: 'wm',
    date: 'September 14, 2025',
    thumbnail: '/images/Untitled-470-x-300-px-300x191.png',
  },
  {
    id: 3,
    slug: 'web-telegram-login-and-features',
    title: 'Web Telegram Login And Features: Simple Guide For 2025',
    excerpt: "Telegram is one of the world's most used messengers, but most people still think of it as a phone app. What many don't realize is that you can use it straight from a browser.",
    content: `<h2>Telegram Web Overview</h2><p>Telegram is one of the world's most used messengers, but most people still think of it as a phone app. What many don't realize is that you can use it straight from a browser.</p><h2>Key Features</h2><ul><li><strong>Full messaging</strong> &mdash; Send and receive messages, media, and files</li><li><strong>Multiple accounts</strong> &mdash; Switch between accounts using different browsers or profiles</li><li><strong>Bots and channels</strong> &mdash; Access all bots and public channels</li></ul>`,
    category: 'Guides',
    author: 'wm',
    date: 'September 14, 2025',
    thumbnail: '/images/Untitled-470-x-300-px-300x191.png',
  },
  {
    id: 4,
    slug: 'how-researchers-use-proxies-for-research-and-web-scraping',
    title: 'How Researchers Use Proxies for Research and Web Scraping',
    excerpt: 'In the age of big data, information is power. Researchers, analysts, and businesses often rely on web scraping to collect large amounts of data.',
    content: `<h2>Academic Research &amp; Proxies</h2><p>In the age of big data, information is power. Researchers, analysts, and businesses often rely on web scraping to collect large amounts of data from the web. Proxies play a crucial role in enabling this at scale.</p><h2>Common Research Applications</h2><ul><li>Price monitoring for economic studies</li><li>Social media sentiment analysis</li><li>News aggregation and media monitoring</li><li>Public records collection</li></ul>`,
    category: 'Comparisons',
    author: 'wm',
    date: 'August 20, 2025',
    thumbnail: '/images/Untitled-470-x-300-px-300x191.png',
  },
  {
    id: 5,
    slug: 'what-is-the-use-case-of-a-proxy',
    title: 'What Is the Use Case of a Proxy?',
    excerpt: "In today's digital world, proxy servers play a crucial role in enhancing security, privacy, and network efficiency.",
    content: `<h2>Common Proxy Use Cases</h2><p>In today's digital world, proxy servers play a crucial role in enhancing security, privacy, and network efficiency. Whether you are a business, developer, or individual user, understanding the use cases of a proxy can help you make better decisions.</p><p>Key use cases include: <strong>Web Scraping</strong>, <strong>Ad Verification</strong>, <strong>SEO Monitoring</strong>, <strong>Brand Protection</strong>, and <strong>Geo-unblocking</strong>.</p>`,
    category: 'Guides',
    author: 'wm',
    date: 'August 15, 2025',
    thumbnail: '/images/Untitled-470-x-300-px-300x191.png',
  },
  {
    id: 6,
    slug: 'proxy-types-explained',
    title: 'Proxy Types Explained: Residential, Datacenter, and Mobile',
    excerpt: 'Not all proxies are created equal. Understanding the differences between proxy types is essential for choosing the right tool.',
    content: `<h2>Comparing Proxy Types</h2><p>Not all proxies are created equal. Understanding the differences between proxy types is essential for choosing the right tool for your specific use case.</p><h3>1. Residential Proxies</h3><p>Residential proxies use real home ISP IP addresses, providing maximum trust and anonymity.</p><h3>2. Datacenter Proxies</h3><p>Hosted in data center facilities offering high speed and lower costs.</p><h3>3. Mobile Proxies</h3><p>Route traffic via authentic 4G/5G mobile carriers.</p>`,
    category: 'Research',
    author: 'wm',
    date: 'August 10, 2025',
    thumbnail: '/images/Untitled-470-x-300-px-300x191.png',
  },
];

// Fetch all posts with optional query params
export async function getPosts(params?: { category?: string; search?: string; limit?: number; page?: number }): Promise<Post[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.page) query.append('page', String(params.page));

    const url = `${API_BASE}/posts${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch posts from API');
    const json = await res.json();
    return json.data || DEFAULT_POSTS;
  } catch (err) {
    console.warn('API error or backend unavailable, returning fallback posts:', err);
    let posts = [...DEFAULT_POSTS];
    if (params?.category && params.category !== 'All') {
      posts = posts.filter(p => p.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      posts = posts.filter(p => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q));
    }
    if (params?.limit) {
      posts = posts.slice(0, params.limit);
    }
    return posts;
  }
}

// Fetch single post by slug or ID
export async function getPost(identifier: string): Promise<Post | null> {
  try {
    const res = await fetch(`${API_BASE}/posts/${identifier}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Post not found in API');
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn('API error or backend unavailable, searching fallback posts:', err);
    const fallback = DEFAULT_POSTS.find(p => p.slug === identifier || String(p.id) === String(identifier));
    return fallback || null;
  }
}

// Create new post
export async function createPost(postData: PostInput): Promise<{ success: boolean; data?: Post; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create post');
    return { success: true, data: json.data, message: json.message };
  } catch (err: any) {
    console.error('Error creating post:', err);
    return { success: false, message: err.message || 'Error communicating with server' };
  }
}

// Update existing post
export async function updatePost(id: number | string, postData: Partial<PostInput>): Promise<{ success: boolean; data?: Post; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update post');
    return { success: true, data: json.data, message: json.message };
  } catch (err: any) {
    console.error('Error updating post:', err);
    return { success: false, message: err.message || 'Error communicating with server' };
  }
}

// Delete post
export async function deletePost(id: number | string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to delete post');
    return { success: true, message: json.message };
  } catch (err: any) {
    console.error('Error deleting post:', err);
    return { success: false, message: err.message || 'Error communicating with server' };
  }
}

// Upload image file
export async function uploadImage(file: File): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Image upload failed');
    return { success: true, url: json.url, message: json.message };
  } catch (err: any) {
    console.error('Error uploading image:', err);
    return { success: false, message: err.message || 'Failed to upload image to server' };
  }
}
