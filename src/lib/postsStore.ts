import fs from 'fs';
import path from 'path';
import type { Post, PostInput } from '@/lib/types/post';
import { slugify } from '@/lib/admin/postForm';
import { initialPosts } from '@/lib/data/initialPosts';

const DATA_FILE = path.join(process.cwd(), 'src/data/posts.json');

function initStore() {
  if (!fs.existsSync(DATA_FILE)) {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialPosts, null, 2), 'utf-8');
  }
}

export function getAllPosts(): Post[] {
  initStore();
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data) as Post[];
  } catch (err) {
    console.error('Error reading posts file:', err);
    return initialPosts;
  }
}

function savePosts(posts: Post[]): boolean {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing posts file:', err);
    return false;
  }
}

export function findPost(identifier: string): Post | undefined {
  const posts = getAllPosts();
  return posts.find(p => p.slug === identifier || String(p.id) === String(identifier));
}

export function createPost(postData: PostInput & { slug?: string }): Post {
  const posts = getAllPosts();
  const maxId = posts.reduce((max, p) => (p.id > max ? p.id : max), 0);
  const newId = maxId + 1;

  let slug = postData.slug ? slugify(postData.slug) : slugify(postData.title);
  if (!slug) slug = `post-${newId}`;

  let uniqueSlug = slug;
  let counter = 1;
  while (posts.some(p => p.slug === uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  const newPost: Post = {
    id: newId,
    slug: uniqueSlug,
    title: postData.title || 'Untitled Post',
    excerpt: postData.excerpt || (postData.content ? postData.content.replace(/<[^>]*>/g, '').slice(0, 160) + '...' : ''),
    content: postData.content || '',
    category: postData.category || 'Guides',
    author: postData.author || 'wm',
    date: postData.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    thumbnail: postData.thumbnail || '/images/Untitled-470-x-300-px-300x191.png',
    url: `/blog/${uniqueSlug}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  posts.unshift(newPost);
  savePosts(posts);
  return newPost;
}

export function updatePost(id: number | string, updateData: Partial<PostInput>): Post | null {
  const posts = getAllPosts();
  const index = posts.findIndex(p => String(p.id) === String(id));
  if (index === -1) return null;

  const currentPost = posts[index];

  let newSlug = currentPost.slug;
  if (updateData.slug && updateData.slug !== currentPost.slug) {
    const cleanSlug = slugify(updateData.slug);
    let uniqueSlug = cleanSlug;
    let counter = 1;
    while (posts.some(p => p.slug === uniqueSlug && String(p.id) !== String(id))) {
      uniqueSlug = `${cleanSlug}-${counter}`;
      counter++;
    }
    newSlug = uniqueSlug;
  }

  const updatedPost: Post = {
    ...currentPost,
    ...updateData,
    id: currentPost.id,
    slug: newSlug,
    updatedAt: new Date().toISOString(),
  };

  posts[index] = updatedPost;
  savePosts(posts);
  return updatedPost;
}

export function deletePost(id: number | string): Post | false {
  const posts = getAllPosts();
  const index = posts.findIndex(p => String(p.id) === String(id));
  if (index === -1) return false;

  const deleted = posts.splice(index, 1);
  savePosts(posts);
  return deleted[0];
}

export interface PostsQuery {
  category?: string;
  search?: string;
  limit?: number;
  page?: number;
}

export function queryPosts(params?: PostsQuery): { data: Post[]; total: number } {
  const { category, search, limit, page } = params || {};
  let result = getAllPosts();

  if (category && category !== 'All') {
    result = result.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      p =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
        (p.content && p.content.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
    );
  }

  const total = result.length;

  if (limit) {
    const numPage = page || 1;
    const startIndex = (numPage - 1) * limit;
    result = result.slice(startIndex, startIndex + limit);
  }

  return { data: result, total };
}

initStore();
