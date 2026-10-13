import { SITE_EMAIL, getAbsoluteSiteUrl } from '@/lib/site';
import type { FaqItem } from '@/lib/data/faqs';
import type { Post } from '@/lib/types/post';
import { resolvePostMetaDescription, resolvePostMetaTitle } from '@/lib/postSeo';

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export type WebPageInput = {
  name: string;
  description: string;
  path: string;
};

function resolveAbsoluteUrl(path: string, siteUrl: string): string {
  return path.startsWith('http') ? path : `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

function resolveAbsoluteImageUrl(thumbnail: string, siteUrl: string): string {
  return thumbnail.startsWith('http') ? thumbnail : `${siteUrl}${thumbnail}`;
}

export function buildOrganizationJsonLd() {
  const siteUrl = getAbsoluteSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ProxyView',
    url: siteUrl,
    logo: `${siteUrl}/images/PROXYVIEW_LOGO.png`,
    email: SITE_EMAIL,
    description:
      'Independent, unbiased proxy and anti-detect browser reviews based on real-world testing.',
  };
}

export function buildWebSiteJsonLd() {
  const siteUrl = getAbsoluteSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ProxyView',
    url: siteUrl,
    publisher: {
      '@type': 'Organization',
      name: 'ProxyView',
    },
  };
}

export function buildWebPageJsonLd({ name, description, path }: WebPageInput) {
  const siteUrl = getAbsoluteSiteUrl();
  const url = resolveAbsoluteUrl(path, siteUrl);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: 'ProxyView',
      url: siteUrl,
    },
  };
}

export function buildFaqPageJsonLd(faqs: FaqItem[], path = '/faq') {
  const siteUrl = getAbsoluteSiteUrl();
  const url = resolveAbsoluteUrl(path, siteUrl);

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
    url,
  };
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  const siteUrl = getAbsoluteSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: resolveAbsoluteUrl(item.path, siteUrl),
    })),
  };
}

export function buildBlogCollectionPageJsonLd(
  posts: Pick<Post, 'slug' | 'title'>[],
  description: string,
  options?: { path?: string; name?: string }
) {
  const siteUrl = getAbsoluteSiteUrl();
  const path = options?.path ?? '/blog';
  const url = resolveAbsoluteUrl(path, siteUrl);

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: options?.name ?? 'Blog — ProxyView',
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: 'ProxyView',
      url: siteUrl,
    },
    ...(posts.length > 0
      ? {
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: posts.map((post, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: post.title,
              url: `${siteUrl}/blog/${post.slug}`,
            })),
          },
        }
      : {}),
  };
}

export function buildBlogPostingJsonLd(post: Post) {
  const siteUrl = getAbsoluteSiteUrl();
  const url = `${siteUrl}/blog/${post.slug}`;
  const datePublished = post.createdAt ?? post.date;
  const dateModified = post.updatedAt ?? post.createdAt ?? post.date;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: resolvePostMetaTitle(post),
    description: resolvePostMetaDescription(post),
    url,
    mainEntityOfPage: url,
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    ...(post.author
      ? {
          author: {
            '@type': 'Person',
            name: post.author,
          },
        }
      : {}),
    ...(post.thumbnail
      ? { image: resolveAbsoluteImageUrl(post.thumbnail, siteUrl) }
      : {}),
    publisher: {
      '@type': 'Organization',
      name: 'ProxyView',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/PROXYVIEW_LOGO.png`,
      },
    },
  };
}

/** @deprecated Use {@link buildBlogPostingJsonLd} instead. */
export const buildArticleJsonLd = buildBlogPostingJsonLd;
