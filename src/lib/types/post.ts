export type PostStatus = 'draft' | 'published' | 'scheduled';

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
  metaTitle: string;
  metaDescription: string;
  url?: string;
  status: PostStatus;
  scheduledAt?: string | null;
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
  metaTitle?: string;
  metaDescription?: string;
  status?: PostStatus;
  scheduledAt?: string | null;
}
