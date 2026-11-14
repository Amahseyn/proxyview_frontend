import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { buildPostMetadata } from '@/lib/postSeo';
import { getPost } from '@/lib/posts.server';
import PostFaqSection from '@/components/blog/PostFaqSection';
import PostTocSection from '@/components/blog/PostTocSection';
import { getPublishedFaqPairs, parsePostFaq } from '@/lib/postFaq';
import {
  blogCategoryPath,
  categoryNameToSlug,
  getCategoryFromSlug,
  isKnownCategorySlug,
} from '@/lib/seo/categories';
import { buildBlogPostingJsonLd, buildBreadcrumbJsonLd, buildFaqPageJsonLd } from '@/lib/seo/jsonLd';
import RecentPosts from '@/components/RecentPosts';
import { normalizeBlogPostHtml } from '@/lib/richTextTable';
import {
  applyTocAnchorsToHtml,
  findTocAnchorForHeading,
  getPublishedTocItems,
  parsePostToc,
} from '@/lib/postToc';

type Props = { params: Promise<{ slug: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Post Not Found — ProxyView' };
  return buildPostMetadata(post);
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  // Helper to check if content contains HTML tags
  const rawContent = post.content || '';
  const isHtml = /<[a-z][\s\S]*>/i.test(rawContent);
  const tocItems = getPublishedTocItems(parsePostToc(post.tocJson));
  let postContentHtml = isHtml ? normalizeBlogPostHtml(rawContent) : rawContent;
  if (isHtml && tocItems.length) {
    postContentHtml = applyTocAnchorsToHtml(postContentHtml, tocItems);
  }
  const faqPairs = getPublishedFaqPairs(parsePostFaq(post.faqJson));
  const postPath = `/blog/${post.slug}`;
  const categorySlug = post.category ? categoryNameToSlug(post.category) : null;
  const categoryLanding =
    categorySlug && isKnownCategorySlug(categorySlug) ? getCategoryFromSlug(categorySlug) : undefined;
  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    ...(categoryLanding
      ? [{ name: categoryLanding.name, path: blogCategoryPath(categoryLanding.slug) }]
      : []),
    { name: post.title, path: postPath },
  ];
  const jsonLd: Record<string, unknown>[] = [
    buildBlogPostingJsonLd(post) as Record<string, unknown>,
    buildBreadcrumbJsonLd(breadcrumbItems) as Record<string, unknown>,
  ];
  if (faqPairs.length) {
    jsonLd.push(buildFaqPageJsonLd(faqPairs, postPath) as Record<string, unknown>);
  }

  return (
    <section className="post-single">
      <JsonLd data={jsonLd} />
      <div className="container">
        <div
          className={`post-single-layout${tocItems.length ? '' : ' post-single-layout--solo'}`}
        >
          <Link href="/blog" className="post-back post-back--top">
            ← Back to Blog
          </Link>

          <div className="post-single-inner post-single-card">
            <div className="post-single-meta">
              {categoryLanding ? (
                <Link href={blogCategoryPath(categoryLanding.slug)} className="post-single-category">
                  {categoryLanding.name}
                </Link>
              ) : post.category ? (
                <span className="post-single-category">{post.category}</span>
              ) : null}
              <span>{post.author || 'wm'}</span>
              <span>·</span>
              <span>{post.date}</span>
            </div>

            <h1>{post.title}</h1>

            {/* Featured Image if present */}
            {post.thumbnail && (
              <div style={{ margin: '28px 0', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc' }}>
                <Image
                  src={post.thumbnail}
                  alt={post.title}
                  width={1200}
                  height={675}
                  unoptimized
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            )}

            {/* Post Content */}
            <div className="post-single-content">
              {isHtml ? (
                <div dangerouslySetInnerHTML={{ __html: postContentHtml }} />
              ) : (
                // Fallback for markdown-style legacy posts
                postContentHtml.split('\n\n').map((para, i) => {
                  if (para.startsWith('## ')) {
                    const text = para.replace('## ', '');
                    const id = findTocAnchorForHeading(text, 2, tocItems);
                    return <h2 key={i} id={id}>{text}</h2>;
                  }
                  if (para.startsWith('### ')) {
                    const text = para.replace('### ', '');
                    const id = findTocAnchorForHeading(text, 3, tocItems);
                    return <h3 key={i} id={id}>{text}</h3>;
                  }
                  if (para.startsWith('**') && para.endsWith('**')) {
                    return <p key={i}><strong>{para.replace(/\*\*/g, '')}</strong></p>;
                  }
                  return <p key={i}>{para}</p>;
                })
              )}
            </div>

            <PostFaqSection faqJson={post.faqJson} />

            {/* Bottom Back Button */}
            <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
              <Link href="/blog" className="btn btn-outline" style={{ padding: '10px 24px' }}>
                ← Return to All Articles
              </Link>
            </div>
          </div>

          {tocItems.length > 0 && (
            <aside className="post-single-sidebar">
              <PostTocSection tocJson={post.tocJson} />
            </aside>
          )}
        </div>
      </div>
      <RecentPosts excludeSlug={post.slug} />
    </section>
  );
}
