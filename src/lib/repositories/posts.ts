import type { Post as PrismaPost } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { isPostPublic, resolveStatusInput } from '@/lib/postStatus';
import type { Post, PostInput } from '@/lib/types/post';
import { slugify } from '@/lib/admin/postForm';

const DEFAULT_THUMBNAIL = '/images/blog/web-scraping.jpg';

function formatDisplayDate(date?: string): string {
  if (date) return date;
  return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function toDomain(record: PrismaPost): Post {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    excerpt: record.excerpt,
    content: record.content,
    category: record.category,
    author: record.author,
    date: record.date,
    thumbnail: record.thumbnail,
    metaTitle: record.metaTitle,
    metaDescription: record.metaDescription,
    url: record.url ?? undefined,
    status: (record.status as Post['status']) || 'published',
    scheduledAt: record.scheduledAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function resolveUniqueSlug(baseSlug: string, excludeId?: number): Promise<string> {
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.post.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || (excludeId !== undefined && existing.id === excludeId)) {
      return candidate;
    }

    candidate = `${baseSlug}-${counter}`;
    counter++;
  }
}

function buildSearchFilter(search: string): Prisma.PostWhereInput {
  return {
    OR: [
      { title: { contains: search } },
      { excerpt: { contains: search } },
      { content: { contains: search } },
      { category: { contains: search } },
      { metaTitle: { contains: search } },
      { metaDescription: { contains: search } },
    ],
  };
}

function buildPublicVisibilityFilter(): Prisma.PostWhereInput {
  const now = new Date();
  return {
    OR: [
      { status: 'published' },
      {
        status: 'scheduled',
        scheduledAt: { lte: now },
      },
    ],
  };
}

export interface PostsQuery {
  category?: string;
  search?: string;
  limit?: number;
  page?: number;
  status?: string;
  admin?: boolean;
}

export async function getAllPosts(admin = false): Promise<Post[]> {
  const records = await prisma.post.findMany({
    where: admin ? undefined : buildPublicVisibilityFilter(),
    orderBy: { id: 'desc' },
  });
  return records.map(toDomain);
}

export async function findPost(identifier: string, options?: { admin?: boolean }): Promise<Post | undefined> {
  const id = Number(identifier);
  const record = await prisma.post.findFirst({
    where: Number.isInteger(id) && id > 0 ? { OR: [{ id }, { slug: identifier }] } : { slug: identifier },
  });

  if (!record) return undefined;

  const post = toDomain(record);
  if (!options?.admin && !isPostPublic(post)) {
    return undefined;
  }

  return post;
}

export async function createPost(postData: PostInput & { slug?: string }): Promise<Post> {
  let slug = postData.slug ? slugify(postData.slug) : slugify(postData.title);
  if (!slug) slug = `post-${Date.now()}`;
  slug = await resolveUniqueSlug(slug);

  const { status, scheduledAt } = resolveStatusInput(postData);

  const record = await prisma.post.create({
    data: {
      slug,
      title: postData.title || 'Untitled Post',
      excerpt:
        postData.excerpt ||
        (postData.content ? `${postData.content.replace(/<[^>]*>/g, '').slice(0, 160)}...` : ''),
      content: postData.content || '',
      category: postData.category || 'Guides',
      author: postData.author || 'wm',
      date: formatDisplayDate(postData.date),
      thumbnail: postData.thumbnail || DEFAULT_THUMBNAIL,
      metaTitle: postData.metaTitle?.trim() || '',
      metaDescription: postData.metaDescription?.trim() || '',
      url: `/blog/${slug}`,
      status,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    },
  });

  return toDomain(record);
}

export async function updatePost(id: number | string, updateData: Partial<PostInput>): Promise<Post | null> {
  const current = await findPost(String(id), { admin: true });
  if (!current) return null;

  let newSlug = current.slug;
  if (updateData.slug && updateData.slug !== current.slug) {
    newSlug = await resolveUniqueSlug(slugify(updateData.slug), current.id);
  }

  const statusUpdate =
    updateData.status !== undefined || updateData.scheduledAt !== undefined
      ? resolveStatusInput({
          status: updateData.status ?? current.status,
          scheduledAt: updateData.scheduledAt ?? current.scheduledAt,
        })
      : null;

  try {
    const record = await prisma.post.update({
      where: { id: current.id },
      data: {
        slug: newSlug,
        title: updateData.title ?? current.title,
        excerpt: updateData.excerpt ?? current.excerpt,
        content: updateData.content ?? current.content,
        category: updateData.category ?? current.category,
        author: updateData.author ?? current.author,
        date: updateData.date ?? current.date,
        thumbnail: updateData.thumbnail ?? current.thumbnail,
        metaTitle: updateData.metaTitle !== undefined ? updateData.metaTitle.trim() : current.metaTitle,
        metaDescription:
          updateData.metaDescription !== undefined
            ? updateData.metaDescription.trim()
            : current.metaDescription,
        url: `/blog/${newSlug}`,
        ...(statusUpdate
          ? {
              status: statusUpdate.status,
              scheduledAt: statusUpdate.scheduledAt ? new Date(statusUpdate.scheduledAt) : null,
            }
          : {}),
      },
    });

    return toDomain(record);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return null;
    }
    throw error;
  }
}

export async function deletePost(id: number | string): Promise<Post | false> {
  const current = await findPost(String(id), { admin: true });
  if (!current) return false;

  try {
    await prisma.post.delete({ where: { id: current.id } });
    return current;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return false;
    }
    throw error;
  }
}

export async function queryPosts(params?: PostsQuery): Promise<{ data: Post[]; total: number }> {
  const { category, search, limit, page, status, admin } = params ?? {};

  const where: Prisma.PostWhereInput = admin ? {} : buildPublicVisibilityFilter();

  if (category && category !== 'All') {
    where.category = category;
  }

  if (status && status !== 'All') {
    where.status = status;
  }

  if (search) {
    Object.assign(where, buildSearchFilter(search));
  }

  const [total, records] = await prisma.$transaction([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: { id: 'desc' },
      ...(limit
        ? {
            take: limit,
            skip: ((page || 1) - 1) * limit,
          }
        : {}),
    }),
  ]);

  return {
    data: records.map(toDomain),
    total,
  };
}
