import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/lib/types/post';
import { getPostCardExcerpt } from '@/lib/postCardExcerpt';

type Props = {
  post: Post;
};

export default function BlogPostCard({ post }: Props) {
  const excerpt = getPostCardExcerpt(post);

  return (
    <Link href={`/blog/${post.slug}`} className="post-card">
      <div className="post-card-thumb">
        {post.thumbnail ? (
          <Image
            src={post.thumbnail}
            alt={post.title}
            width={470}
            height={300}
            unoptimized
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div className="post-card-thumb-placeholder">ProxyView</div>
        )}
        {post.category && <span className="post-card-badge">{post.category}</span>}
      </div>
      <div className="post-card-body">
        <p className="post-card-meta">{post.author || 'wm'} · {post.date}</p>
        <h3 className="post-card-title">{post.title}</h3>
        {excerpt ? <p className="post-card-excerpt">{excerpt}</p> : null}
        <span className="post-card-link">Read More »</span>
      </div>
    </Link>
  );
}
