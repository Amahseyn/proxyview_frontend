// Client-side API helpers (fetch to /api routes)

import type { Post, PostInput } from '@/lib/types/post';
import type { ContactMessage } from '@/lib/types/contact';
import type {
  GlossaryPageConfig,
  GlossaryPageConfigInput,
  GlossaryPageContent,
  GlossaryTerm,
  GlossaryTermInput,
} from '@/lib/types/glossary';

export type { Post, PostInput, ContactMessage, GlossaryTerm, GlossaryTermInput, GlossaryPageConfig, GlossaryPageContent };

const API_BASE = '/api';

export async function getPosts(params?: {
  category?: string;
  search?: string;
  status?: string;
  limit?: number;
  page?: number;
  admin?: boolean;
}): Promise<Post[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'All') query.append('category', params.category);
  if (params?.search) query.append('search', params.search);
  if (params?.status && params.status !== 'All') query.append('status', params.status);
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.page) query.append('page', String(params.page));
  if (params?.admin) query.append('admin', 'true');

  const url = `${API_BASE}/posts${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch posts');
  const json = await res.json();
  return json.data || [];
}

export async function getPost(identifier: string, admin = true): Promise<Post | null> {
  const query = admin ? '?admin=true' : '';
  const res = await fetch(`${API_BASE}/posts/${identifier}${query}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data || null;
}

export async function createPost(postData: PostInput): Promise<{ success: boolean; data?: Post; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create post');
    return { success: true, data: json.data, message: json.message };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error communicating with server';
    return { success: false, message };
  }
}

export async function updatePost(id: number | string, postData: Partial<PostInput>): Promise<{ success: boolean; data?: Post; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update post');
    return { success: true, data: json.data, message: json.message };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error communicating with server';
    return { success: false, message };
  }
}

export async function deletePost(id: number | string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/posts/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to delete post');
    return { success: true, message: json.message };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error communicating with server';
    return { success: false, message };
  }
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const res = await fetch(`${API_BASE}/contact`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch contact messages');
  const json = await res.json();
  return json.data || [];
}

export async function deleteContactMessage(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/contact/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to delete message');
    return { success: true, message: json.message };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error communicating with server';
    return { success: false, message };
  }
}

export async function getGlossaryContent(): Promise<GlossaryPageContent> {
  const res = await fetch(`${API_BASE}/glossary`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch glossary content');
  const json = await res.json();
  return json.data;
}

export async function getGlossaryTerm(id: number | string): Promise<GlossaryTerm | null> {
  const res = await fetch(`${API_BASE}/glossary/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data || null;
}

export async function createGlossaryTerm(
  termData: GlossaryTermInput
): Promise<{ success: boolean; data?: GlossaryTerm; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/glossary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(termData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create glossary term');
    return { success: true, data: json.data, message: json.message };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error communicating with server';
    return { success: false, message };
  }
}

export async function updateGlossaryTerm(
  id: number | string,
  termData: Partial<GlossaryTermInput>
): Promise<{ success: boolean; data?: GlossaryTerm; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/glossary/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(termData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update glossary term');
    return { success: true, data: json.data, message: json.message };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error communicating with server';
    return { success: false, message };
  }
}

export async function deleteGlossaryTerm(
  id: number | string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/glossary/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to delete glossary term');
    return { success: true, message: json.message };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error communicating with server';
    return { success: false, message };
  }
}

export async function updateGlossaryPageConfig(
  configData: GlossaryPageConfigInput
): Promise<{ success: boolean; data?: GlossaryPageConfig; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/glossary/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update glossary page');
    return { success: true, data: json.data, message: json.message };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error communicating with server';
    return { success: false, message };
  }
}

export async function uploadImage(file: File): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Image upload failed');
    const imageUrl = json.relativeUrl || json.url;
    return { success: true, url: imageUrl, message: json.message };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to upload image to server';
    return { success: false, message };
  }
}
