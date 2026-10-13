import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { isPostPublic, resolveStatusInput } from '@/lib/postStatus';
import type { Post, PostInput } from '@/lib/types/post';
import { slugify } from '@/lib/admin/postForm';

const DEFAULT_THUMBNAIL = '/images/blog/web-scraping.jpg';

const postInclude = {
  categories: { include: { category: true } },
  tags: { include: { tag: true } },
} satisfies Prisma.PostInclude;

type PostRecord = Prisma.PostGetPayload<{ include: typeof postInclude }>;

function formatDisplayDate(date?: string): string {
  if (date) return date;
  return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function toDomain(record: PostRecord): Post {
  const categories = record.categories.map(pc => ({
    id: pc.category.id,
    name: pc.category.name,
    slug: pc.category.slug,
    description: pc.category.description,
  }));
  const tags = record.tags.map(pt => ({
    id: pt.tag.id,
    name: pt.tag.name,
    slug: pt.tag.slug,
  }));

  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    excerpt: record.excerpt,
    content: record.content,
    blocksJson: record.blocksJson,
    faqJson: record.faqJson,
    tocJson: record.tocJson,
    category: record.category,
    categoryIds: categories.map(c => c.id),
    categories,
    tagIds: tags.map(t => t.id),
    tags,
    author: record.author,
    date: record.date,
    thumbnail: record.thumbnail,
    metaTitle: record.metaTitle,
    metaDescription: record.metaDescription,
    canonicalUrl: record.canonicalUrl,
    ogImage: record.ogImage,
    seoNoIndex: record.seoNoIndex,
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

async function resolveCategoryLabel(categoryIds?: number[], fallback = 'Guides'): Promise<string> {
  if (!categoryIds?.length) return fallback;
  const cat = await prisma.category.findUnique({ where: { id: categoryIds[0] } });
  return cat?.name ?? fallback;
}

async function syncPostCategories(postId: number, categoryIds: number[]): Promise<void> {
  await prisma.postCategory.deleteMany({ where: { postId } });
  if (categoryIds.length) {
    await prisma.postCategory.createMany({
      data: categoryIds.map(categoryId => ({ postId, categoryId })),
    });
  }
}

async function syncPostTags(postId: number, tagIds: number[]): Promise<void> {
  await prisma.postTag.deleteMany({ where: { postId } });
  if (tagIds.length) {
    await prisma.postTag.createMany({
      data: tagIds.map(tagId => ({ postId, tagId })),
    });
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
      { author: { contains: search } },
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

export type PostSortField = 'id' | 'title' | 'date' | 'updatedAt' | 'status';

export interface PostsQuery {
  category?: string;
  tagId?: number;
  search?: string;
  limit?: number;
  page?: number;
  status?: string;
  admin?: boolean;
  excludeSlug?: string;
  sortBy?: PostSortField;
  sortOrder?: 'asc' | 'desc';
}

function buildOrderBy(sortBy?: PostSortField, sortOrder?: 'asc' | 'desc'): Prisma.PostOrderByWithRelationInput {
  const direction = sortOrder === 'asc' ? 'asc' : 'desc';
  switch (sortBy) {
    case 'title':
      return { title: direction };
    case 'date':
      return { date: direction };
    case 'updatedAt':
      return { updatedAt: direction };
    case 'status':
      return { status: direction };
    default:
      return { id: direction };
  }
}

export async function getAllPosts(admin = false): Promise<Post[]> {
  const records = await prisma.post.findMany({
    where: admin ? undefined : buildPublicVisibilityFilter(),
    orderBy: { id: 'desc' },
    include: postInclude,
  });
  return records.map(toDomain);
}

export async function findPost(identifier: string, options?: { admin?: boolean }): Promise<Post | undefined> {
  const id = Number(identifier);
  const record = await prisma.post.findFirst({
    where: Number.isInteger(id) && id > 0 ? { OR: [{ id }, { slug: identifier }] } : { slug: identifier },
    include: postInclude,
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
  const categoryLabel = await resolveCategoryLabel(postData.categoryIds, postData.category || 'Guides');

  const record = await prisma.post.create({
    data: {
      slug,
      title: postData.title || 'Untitled Post',
      excerpt:
        postData.excerpt ||
        (postData.content ? `${postData.content.replace(/<[^>]*>/g, '').slice(0, 160)}...` : ''),
      content: postData.content || '',
      blocksJson: postData.blocksJson || '',
      faqJson: postData.faqJson || '',
      tocJson: postData.tocJson || '',
      category: categoryLabel,
      author: postData.author || 'wm',
      date: formatDisplayDate(postData.date),
      thumbnail: postData.thumbnail || DEFAULT_THUMBNAIL,
      metaTitle: postData.metaTitle?.trim() || '',
      metaDescription: postData.metaDescription?.trim() || '',
      canonicalUrl: postData.canonicalUrl?.trim() || '',
      ogImage: postData.ogImage?.trim() || '',
      seoNoIndex: postData.seoNoIndex ?? false,
      url: `/blog/${slug}`,
      status,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    },
    include: postInclude,
  });

  if (postData.categoryIds?.length) {
    await syncPostCategories(record.id, postData.categoryIds);
  }
  if (postData.tagIds?.length) {
    await syncPostTags(record.id, postData.tagIds);
  }

  const refreshed = await prisma.post.findUnique({ where: { id: record.id }, include: postInclude });
  return toDomain(refreshed!);
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

  const categoryLabel =
    updateData.categoryIds !== undefined
      ? await resolveCategoryLabel(updateData.categoryIds, updateData.category ?? current.category)
      : updateData.category ?? current.category;

  try {
    await prisma.post.update({
      where: { id: current.id },
      data: {
        slug: newSlug,
        title: updateData.title ?? current.title,
        excerpt: updateData.excerpt ?? current.excerpt,
        content: updateData.content ?? current.content,
        blocksJson: updateData.blocksJson ?? current.blocksJson,
        faqJson: updateData.faqJson ?? current.faqJson,
        tocJson: updateData.tocJson ?? current.tocJson,
        category: categoryLabel,
        author: updateData.author ?? current.author,
        date: updateData.date ?? current.date,
        thumbnail: updateData.thumbnail ?? current.thumbnail,
        metaTitle: updateData.metaTitle !== undefined ? updateData.metaTitle.trim() : current.metaTitle,
        metaDescription:
          updateData.metaDescription !== undefined
            ? updateData.metaDescription.trim()
            : current.metaDescription,
        canonicalUrl:
          updateData.canonicalUrl !== undefined ? updateData.canonicalUrl.trim() : current.canonicalUrl,
        ogImage: updateData.ogImage !== undefined ? updateData.ogImage.trim() : current.ogImage,
        seoNoIndex: updateData.seoNoIndex ?? current.seoNoIndex,
        url: `/blog/${newSlug}`,
        ...(statusUpdate
          ? {
              status: statusUpdate.status,
              scheduledAt: statusUpdate.scheduledAt ? new Date(statusUpdate.scheduledAt) : null,
            }
          : {}),
      },
    });

    if (updateData.categoryIds !== undefined) {
      await syncPostCategories(current.id, updateData.categoryIds);
    }
    if (updateData.tagIds !== undefined) {
      await syncPostTags(current.id, updateData.tagIds);
    }

    const refreshed = await prisma.post.findUnique({ where: { id: current.id }, include: postInclude });
    return refreshed ? toDomain(refreshed) : null;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return null;
    }
    throw error;
  }
}

export async function duplicatePost(id: number | string): Promise<Post | null> {
  const current = await findPost(String(id), { admin: true });
  if (!current) return null;

  return createPost({
    title: `${current.title} (Copy)`,
    content: current.content,
    blocksJson: current.blocksJson,
    faqJson: current.faqJson,
    tocJson: current.tocJson,
    excerpt: current.excerpt,
    category: current.category,
    categoryIds: current.categoryIds,
    tagIds: current.tagIds,
    author: current.author,
    date: current.date,
    thumbnail: current.thumbnail,
    metaTitle: current.metaTitle,
    metaDescription: current.metaDescription,
    canonicalUrl: '',
    ogImage: current.ogImage,
    seoNoIndex: current.seoNoIndex,
    status: 'draft',
    scheduledAt: null,
  });
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
  const { category, tagId, search, limit, page, status, admin, excludeSlug, sortBy, sortOrder } = params ?? {};

  const where: Prisma.PostWhereInput = admin ? {} : buildPublicVisibilityFilter();

  if (excludeSlug) {
    where.slug = { not: excludeSlug };
  }

  if (category && category !== 'All') {
    const categoryFilter: Prisma.PostWhereInput = {
      OR: [
        { category },
        { categories: { some: { category: { OR: [{ name: category }, { slug: category }] } } } },
      ],
    };
    where.AND = [...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []), categoryFilter];
  }

  if (tagId && tagId > 0) {
    where.tags = { some: { tagId } };
  }

  if (status && status !== 'All') {
    where.status = status;
  }

  if (search) {
    const searchFilter = buildSearchFilter(search);
    where.AND = [...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []), searchFilter];
  }

  const [total, records] = await prisma.$transaction([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: buildOrderBy(sortBy, sortOrder),
      include: postInclude,
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
