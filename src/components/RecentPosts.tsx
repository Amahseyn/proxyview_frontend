import { getPosts } from '@/lib/posts.server';
import BlogPostCard from '@/components/BlogPostCard';

type Props = {
  excludeSlug: string;
  limit?: number;
};

export default async function RecentPosts({ excludeSlug, limit = 3 }: Props) {
  const posts = await getPosts({ limit, excludeSlug });
  if (posts.length === 0) return null;

  return (
    <section className="post-recent" aria-labelledby="recent-posts-heading">
      <div className="container">
        <h2 id="recent-posts-heading" className="post-recent-title">Recent Articles</h2>
        <div className="blog-grid">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
