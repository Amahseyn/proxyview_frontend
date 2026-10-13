import type { Post } from '@/lib/types/post';
import { blogPosts } from '@/lib/data/blogPosts';

export const initialPosts: Post[] = blogPosts.map((post, index) => ({
  ...post,
  id: index + 1,
  status: 'published',
  scheduledAt: null,
  metaTitle: '',
  metaDescription: '',
  blocksJson: '',
  faqJson: '',
  tocJson: '',
  categoryIds: [],
  categories: [],
  tagIds: [],
  tags: [],
  canonicalUrl: '',
  ogImage: '',
  seoNoIndex: false,
}));
