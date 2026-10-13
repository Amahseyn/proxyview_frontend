import type { Category } from '@/lib/types/category';
import type { Tag } from '@/lib/types/tag';

export type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  blocksJson: string;
  faqJson: string;
  tocJson: string;
  category: string;
  categoryIds: number[];
  categories: Category[];
  tagIds: number[];
  tags: Tag[];
  author: string;
  date: string;
  thumbnail: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogImage: string;
  seoNoIndex: boolean;
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
  blocksJson?: string;
  faqJson?: string;
  tocJson?: string;
  category?: string;
  categoryIds?: number[];
  tagIds?: number[];
  author?: string;
  date?: string;
  thumbnail?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  seoNoIndex?: boolean;
  status?: PostStatus;
  scheduledAt?: string | null;
}
