import type { Post } from '@/lib/types/post';

/** Newest first using publish metadata (falls back to createdAt). */
export function sortPostsByDateDesc(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => postTimestamp(b) - postTimestamp(a));
}

function postTimestamp(post: Post): number {
  const fromDisplay = Date.parse(post.date);
  if (!Number.isNaN(fromDisplay)) return fromDisplay;
  if (post.createdAt) {
    const fromCreated = Date.parse(post.createdAt);
    if (!Number.isNaN(fromCreated)) return fromCreated;
  }
  return post.id;
}
