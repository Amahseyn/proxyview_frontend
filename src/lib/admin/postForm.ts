import type { Post, PostInput } from '@/lib/types/post';
import { DEFAULT_AUTHOR, DEFAULT_THUMBNAIL, POST_CATEGORIES } from '@/lib/admin/constants';

export interface PostFormValues {
  title: string;
  slug: string;
  category: string;
  customCategory: string;
  author: string;
  date: string;
  thumbnail: string;
  excerpt: string;
  content: string;
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
    content: '',
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
    content: post.content || '',
  };
}

export function formValuesToPostInput(values: PostFormValues): PostInput {
  return {
    title: values.title.trim(),
    slug: values.slug.trim() || undefined,
    category: resolveCategory(values.category, values.customCategory),
    author: values.author.trim() || DEFAULT_AUTHOR,
    date: values.date.trim() || undefined,
    thumbnail: values.thumbnail || DEFAULT_THUMBNAIL,
    excerpt: values.excerpt.trim() || undefined,
    content: values.content || '',
  };
}

export function filterAdminPosts(posts: Post[], searchQuery: string, selectedCategory: string): Post[] {
  let result = [...posts];

  if (selectedCategory !== 'All') {
    result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    result = result.filter(
      p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  return result;
}

export function getPostCategories(posts: Post[]): string[] {
  return ['All', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];
}
