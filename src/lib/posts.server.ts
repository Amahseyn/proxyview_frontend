import 'server-only';

import type { Post } from '@/lib/types/post';
import { findPost, queryPosts } from '@/lib/repositories/posts';

export type { Post } from '@/lib/types/post';

export async function getPosts(params?: {
  category?: string;
  search?: string;
  limit?: number;
  page?: number;
}): Promise<Post[]> {
  const result = await queryPosts({ ...params, admin: false });
  return result.data;
}

export async function getPost(identifier: string): Promise<Post | null> {
  const post = await findPost(identifier, { admin: false });
  return post ?? null;
}
