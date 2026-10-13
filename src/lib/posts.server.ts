import 'server-only';

import { sortPostsByDateDesc } from '@/lib/blog/sortPosts';
import type { Post } from '@/lib/types/post';
import { findPost, queryPosts } from '@/lib/repositories/posts';

export type { Post } from '@/lib/types/post';

export const BLOG_LIST_PAGE_SIZE = 10;

export async function getPosts(params?: {
  category?: string;
  search?: string;
  limit?: number;
  page?: number;
  excludeSlug?: string;
}): Promise<Post[]> {
  const result = await queryPosts({ ...params, admin: false });
  return result.data;
}

export async function getBlogListPage(params?: {
  category?: string;
  page?: number;
}): Promise<{ posts: Post[]; total: number; page: number; pageCount: number }> {
  const pageSize = BLOG_LIST_PAGE_SIZE;
  const requestedPage = Math.max(1, params?.page ?? 1);
  const { data } = await queryPosts({
    category: params?.category,
    admin: false,
  });
  const sorted = sortPostsByDateDesc(data);
  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const posts = sorted.slice((page - 1) * pageSize, page * pageSize);

  return { posts, total, page, pageCount };
}

export async function getPost(identifier: string): Promise<Post | null> {
  const post = await findPost(identifier, { admin: false });
  return post ?? null;
}
