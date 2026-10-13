import type { Post, PostInput } from '@/lib/types/post';
import {
  createPost as repoCreatePost,
  deletePost as repoDeletePost,
  findPost as repoFindPost,
  getAllPosts as repoGetAllPosts,
  queryPosts as repoQueryPosts,
  updatePost as repoUpdatePost,
  duplicatePost as repoDuplicatePost,
  type PostsQuery,
} from '@/lib/repositories/posts';

export type { PostsQuery };

export function getAllPosts(admin = false): Promise<Post[]> {
  return repoGetAllPosts(admin);
}

export function findPost(identifier: string, options?: { admin?: boolean }): Promise<Post | undefined> {
  return repoFindPost(identifier, options);
}

export function createPost(postData: PostInput & { slug?: string }): Promise<Post> {
  return repoCreatePost(postData);
}

export function updatePost(id: number | string, updateData: Partial<PostInput>): Promise<Post | null> {
  return repoUpdatePost(id, updateData);
}

export function deletePost(id: number | string): Promise<Post | false> {
  return repoDeletePost(id);
}

export function queryPosts(params?: PostsQuery): Promise<{ data: Post[]; total: number }> {
  return repoQueryPosts(params);
}

export function duplicatePost(id: number | string): Promise<Post | null> {
  return repoDuplicatePost(id);
}
