import type { Post, PostInput, PostStatus } from '@/lib/types/post';
import { DEFAULT_AUTHOR, DEFAULT_THUMBNAIL, POST_CATEGORIES } from '@/lib/admin/constants';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@/lib/postStatus';

export type PublishOption = 'draft' | 'publish' | 'schedule';

export interface PostFormValues {
  title: string;
  slug: string;
  category: string;
  customCategory: string;
  author: string;
  date: string;
  thumbnail: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  publishOption: PublishOption;
  scheduledAt: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatPostDate(date = new Date()): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function extractExcerpt(content: string, maxLength = 150): string {
  const plainText = content.replace(/<[^>]*>/g, '').trim();
  if (!plainText) return '';
  return plainText.slice(0, maxLength) + (plainText.length > maxLength ? '...' : '');
}

export function resolveCategory(category: string, customCategory: string): string {
  return category === 'Other' ? customCategory.trim() || 'Guides' : category;
}

export function parseCategoryFromPost(category: string): Pick<PostFormValues, 'category' | 'customCategory'> {
  const isPreset = (POST_CATEGORIES as readonly string[]).includes(category);
  return isPreset
    ? { category, customCategory: '' }
    : { category: 'Other', customCategory: category };
}

export function statusToPublishOption(status: PostStatus, scheduledAt?: string | null): PublishOption {
  if (status === 'draft') return 'draft';
  if (status === 'scheduled') {
    if (scheduledAt && new Date(scheduledAt) <= new Date()) {
      return 'publish';
    }
    return 'schedule';
  }
  return 'publish';
}

export function publishOptionToStatus(option: PublishOption): PostStatus {
  switch (option) {
    case 'draft':
      return 'draft';
    case 'schedule':
      return 'scheduled';
    case 'publish':
      return 'published';
  }
}

export function emptyPostFormValues(): PostFormValues {
  return {
    title: '',
    slug: '',
    category: 'Guides',
    customCategory: '',
    author: DEFAULT_AUTHOR,
    date: formatPostDate(),
    thumbnail: DEFAULT_THUMBNAIL,
    excerpt: '',
    metaTitle: '',
    metaDescription: '',
    content: '',
    publishOption: 'draft',
    scheduledAt: '',
  };
}

export function postToFormValues(post: Post): PostFormValues {
  const { category, customCategory } = parseCategoryFromPost(post.category || 'Guides');
  return {
    title: post.title || '',
    slug: post.slug || '',
    category,
    customCategory,
    author: post.author || DEFAULT_AUTHOR,
    date: post.date || '',
    thumbnail: post.thumbnail || '',
    excerpt: post.excerpt || '',
    metaTitle: post.metaTitle || '',
    metaDescription: post.metaDescription || '',
    content: post.content || '',
    publishOption: statusToPublishOption(post.status, post.scheduledAt),
    scheduledAt: toDateTimeLocalValue(post.scheduledAt),
  };
}

export function formValuesToPostInput(values: PostFormValues): PostInput {
  const status = publishOptionToStatus(values.publishOption);
  const scheduledAt =
    status === 'scheduled' ? fromDateTimeLocalValue(values.scheduledAt) : null;

  return {
    title: values.title.trim(),
    slug: values.slug.trim() || undefined,
    category: resolveCategory(values.category, values.customCategory),
    author: values.author.trim() || DEFAULT_AUTHOR,
    date: values.date.trim() || undefined,
    thumbnail: values.thumbnail || DEFAULT_THUMBNAIL,
    excerpt: values.excerpt.trim() || undefined,
    metaTitle: values.metaTitle.trim() || undefined,
    metaDescription: values.metaDescription.trim() || undefined,
    content: values.content || '',
    status,
    scheduledAt,
  };
}

export function getSubmitLabel(option: PublishOption, mode: 'create' | 'edit'): string {
  switch (option) {
    case 'draft':
      return mode === 'create' ? 'Save Draft' : 'Save Draft';
    case 'schedule':
      return mode === 'create' ? 'Schedule Post' : 'Update Schedule';
    case 'publish':
      return mode === 'create' ? 'Publish Post' : 'Publish Changes';
  }
}

export function getSubmittingLabel(option: PublishOption): string {
  switch (option) {
    case 'draft':
      return 'Saving draft...';
    case 'schedule':
      return 'Scheduling...';
    case 'publish':
      return 'Publishing...';
  }
}

export function filterAdminPosts(
  posts: Post[],
  searchQuery: string,
  selectedCategory: string,
  selectedStatus: string
): Post[] {
  let result = [...posts];

  if (selectedCategory !== 'All') {
    result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
  }

  if (selectedStatus !== 'All') {
    result = result.filter(p => p.status === selectedStatus);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    result = result.filter(
      p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.metaTitle.toLowerCase().includes(q) ||
        p.metaDescription.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  return result;
}

export function getPostCategories(posts: Post[]): string[] {
  return ['All', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];
}
