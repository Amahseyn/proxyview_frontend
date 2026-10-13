import type { Post, PostInput, PostStatus } from '@/lib/types/post';
import { DEFAULT_AUTHOR, DEFAULT_THUMBNAIL, POST_CATEGORIES } from '@/lib/admin/constants';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@/lib/postStatus';

export type PublishOption = 'draft' | 'publish' | 'schedule' | 'archive';

export interface PostFormValues {
  title: string;
  slug: string;
  category: string;
  customCategory: string;
  categoryIds: number[];
  tagIds: number[];
  author: string;
  date: string;
  thumbnail: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogImage: string;
  seoNoIndex: boolean;
  content: string;
  blocksJson: string;
  faqJson: string;
  tocJson: string;
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

/** Blog card badge: primary taxonomy category, or legacy label when none selected. */
export function categoryLabelFromFormValues(
  values: Pick<PostFormValues, 'categoryIds' | 'category' | 'customCategory'>,
  categories: { id: number; name: string }[] = []
): string {
  const primaryId = values.categoryIds[0];
  if (primaryId != null) {
    const match = categories.find(c => c.id === primaryId);
    if (match) return match.name;
  }
  return resolveCategory(values.category, values.customCategory);
}

export function parseCategoryFromPost(category: string): Pick<PostFormValues, 'category' | 'customCategory'> {
  const isPreset = (POST_CATEGORIES as readonly string[]).includes(category);
  return isPreset
    ? { category, customCategory: '' }
    : { category: 'Other', customCategory: category };
}

export function statusToPublishOption(status: PostStatus, scheduledAt?: string | null): PublishOption {
  if (status === 'archived') return 'archive';
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
    case 'archive':
      return 'archived';
  }
}

export function emptyPostFormValues(): PostFormValues {
  return {
    title: '',
    slug: '',
    category: 'Guides',
    customCategory: '',
    categoryIds: [],
    tagIds: [],
    author: DEFAULT_AUTHOR,
    date: formatPostDate(),
    thumbnail: DEFAULT_THUMBNAIL,
    excerpt: '',
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    ogImage: '',
    seoNoIndex: false,
    content: '',
    blocksJson: '',
    faqJson: '',
    tocJson: '',
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
    categoryIds: post.categoryIds?.length ? post.categoryIds : [],
    tagIds: post.tagIds?.length ? post.tagIds : [],
    author: post.author || DEFAULT_AUTHOR,
    date: post.date || '',
    thumbnail: post.thumbnail || '',
    excerpt: post.excerpt || '',
    metaTitle: post.metaTitle || '',
    metaDescription: post.metaDescription || '',
    canonicalUrl: post.canonicalUrl || '',
    ogImage: post.ogImage || '',
    seoNoIndex: post.seoNoIndex ?? false,
    content: post.content || '',
    blocksJson: post.blocksJson || '',
    faqJson: post.faqJson || '',
    tocJson: post.tocJson || '',
    publishOption: statusToPublishOption(post.status, post.scheduledAt),
    scheduledAt: toDateTimeLocalValue(post.scheduledAt),
  };
}

export function formValuesToPostInput(
  values: PostFormValues,
  taxonomy?: { categories?: { id: number; name: string }[] }
): PostInput {
  const status = publishOptionToStatus(values.publishOption);
  const scheduledAt =
    status === 'scheduled' ? fromDateTimeLocalValue(values.scheduledAt) : null;

  return {
    title: values.title.trim(),
    slug: values.slug.trim() || undefined,
    category: categoryLabelFromFormValues(values, taxonomy?.categories),
    categoryIds: values.categoryIds,
    tagIds: values.tagIds,
    author: values.author.trim() || DEFAULT_AUTHOR,
    date: values.date.trim() || undefined,
    thumbnail: values.thumbnail || DEFAULT_THUMBNAIL,
    excerpt: values.excerpt.trim() || undefined,
    metaTitle: values.metaTitle.trim() || undefined,
    metaDescription: values.metaDescription.trim() || undefined,
    canonicalUrl: values.canonicalUrl.trim() || undefined,
    ogImage: values.ogImage.trim() || undefined,
    seoNoIndex: values.seoNoIndex,
    content: values.content || '',
    blocksJson: values.blocksJson || '',
    faqJson: values.faqJson || '',
    tocJson: values.tocJson || '',
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
    case 'archive':
      return 'Save as Archived';
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
    case 'archive':
      return 'Archiving...';
  }
}

export function filterAdminPosts(
  posts: Post[],
  searchQuery: string,
  selectedCategory: string,
  selectedStatus: string,
  selectedTagId: number | 'All' = 'All'
): Post[] {
  let result = [...posts];

  if (selectedCategory !== 'All') {
    result = result.filter(
      p =>
        p.category.toLowerCase() === selectedCategory.toLowerCase() ||
        p.categories.some(c => c.name.toLowerCase() === selectedCategory.toLowerCase())
    );
  }

  if (selectedStatus !== 'All') {
    result = result.filter(p => p.status === selectedStatus);
  }

  if (selectedTagId !== 'All') {
    result = result.filter(p => p.tagIds.includes(selectedTagId));
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
        p.category.toLowerCase().includes(q) ||
        p.tags.some(t => t.name.toLowerCase().includes(q))
    );
  }

  return result;
}

export function sortAdminPosts(
  posts: Post[],
  sortBy: 'title' | 'date' | 'updatedAt' | 'status' | 'id',
  sortOrder: 'asc' | 'desc'
): Post[] {
  const dir = sortOrder === 'asc' ? 1 : -1;
  return [...posts].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title) * dir;
      case 'date':
        return a.date.localeCompare(b.date) * dir;
      case 'status':
        return a.status.localeCompare(b.status) * dir;
      case 'updatedAt':
        return ((a.updatedAt || '').localeCompare(b.updatedAt || '')) * dir;
      default:
        return (a.id - b.id) * dir;
    }
  });
}

export function getPostCategories(posts: Post[]): string[] {
  const fromPosts = posts.flatMap(p => [p.category, ...p.categories.map(c => c.name)]).filter(Boolean);
  return ['All', ...Array.from(new Set(fromPosts))];
}
