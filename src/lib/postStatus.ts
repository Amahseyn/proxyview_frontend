import type { Post, PostInput, PostStatus } from '@/lib/types/post';

export const POST_STATUSES: PostStatus[] = ['draft', 'published', 'scheduled'];

export function isValidPostStatus(value: string): value is PostStatus {
  return POST_STATUSES.includes(value as PostStatus);
}

export function isPostPublic(post: Pick<Post, 'status' | 'scheduledAt'>): boolean {
  if (post.status === 'draft') return false;
  if (post.status === 'published') return true;
  if (post.status === 'scheduled' && post.scheduledAt) {
    return new Date(post.scheduledAt) <= new Date();
  }
  return false;
}

export function getPostStatusLabel(status: PostStatus): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'scheduled':
      return 'Scheduled';
    case 'published':
      return 'Published';
  }
}

export function formatScheduledAt(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  return value.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function toDateTimeLocalValue(date?: string | Date | null): string {
  if (!date) return '';
  const value = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return '';

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export function fromDateTimeLocalValue(value: string): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export function resolveStatusInput(input: Pick<PostInput, 'status' | 'scheduledAt'>): {
  status: PostStatus;
  scheduledAt: string | null;
} {
  const status = input.status && isValidPostStatus(input.status) ? input.status : 'published';

  if (status === 'scheduled') {
    const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;
    if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) {
      throw new Error('Scheduled posts require a valid publish date and time.');
    }
    if (scheduledAt <= new Date()) {
      throw new Error('Scheduled publish time must be in the future.');
    }
    return { status, scheduledAt: scheduledAt.toISOString() };
  }

  return { status, scheduledAt: null };
}
