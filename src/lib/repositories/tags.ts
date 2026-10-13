import type { Tag as PrismaTag } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/admin/postForm';
import type { Tag, TagInput } from '@/lib/types/tag';

function toDomain(record: PrismaTag): Tag {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function resolveUniqueSlug(baseSlug: string, excludeId?: number): Promise<string> {
  let candidate = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.tag.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing || (excludeId !== undefined && existing.id === excludeId)) return candidate;
    candidate = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function getAllTags(): Promise<Tag[]> {
  const records = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
  return records.map(toDomain);
}

export async function findTag(id: number): Promise<Tag | null> {
  const record = await prisma.tag.findUnique({ where: { id } });
  return record ? toDomain(record) : null;
}

export async function createTag(input: TagInput): Promise<Tag> {
  const name = input.name.trim();
  let slug = slugify(input.slug?.trim() || name);
  if (!slug) slug = `tag-${Date.now()}`;
  slug = await resolveUniqueSlug(slug);

  const record = await prisma.tag.create({ data: { name, slug } });
  return toDomain(record);
}

export async function updateTag(id: number, input: Partial<TagInput>): Promise<Tag | null> {
  const current = await prisma.tag.findUnique({ where: { id } });
  if (!current) return null;

  let slug = current.slug;
  if (input.slug !== undefined || input.name !== undefined) {
    const base = slugify(input.slug?.trim() || input.name?.trim() || current.name);
    if (base && base !== current.slug) {
      slug = await resolveUniqueSlug(base, id);
    }
  }

  const record = await prisma.tag.update({
    where: { id },
    data: { name: input.name?.trim() ?? current.name, slug },
  });
  return toDomain(record);
}

export async function deleteTag(id: number): Promise<boolean> {
  try {
    await prisma.tag.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
