import type { Category as PrismaCategory } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/admin/postForm';
import type { Category, CategoryInput } from '@/lib/types/category';

function toDomain(record: PrismaCategory): Category {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function resolveUniqueSlug(baseSlug: string, excludeId?: number): Promise<string> {
  let candidate = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing || (excludeId !== undefined && existing.id === excludeId)) return candidate;
    candidate = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function getAllCategories(): Promise<Category[]> {
  const records = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return records.map(toDomain);
}

export async function findCategory(id: number): Promise<Category | null> {
  const record = await prisma.category.findUnique({ where: { id } });
  return record ? toDomain(record) : null;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const name = input.name.trim();
  let slug = slugify(input.slug?.trim() || name);
  if (!slug) slug = `category-${Date.now()}`;
  slug = await resolveUniqueSlug(slug);

  const record = await prisma.category.create({
    data: {
      name,
      slug,
      description: input.description?.trim() || '',
    },
  });
  return toDomain(record);
}

export async function updateCategory(id: number, input: Partial<CategoryInput>): Promise<Category | null> {
  const current = await prisma.category.findUnique({ where: { id } });
  if (!current) return null;

  let slug = current.slug;
  if (input.slug !== undefined || input.name !== undefined) {
    const base = slugify(input.slug?.trim() || input.name?.trim() || current.name);
    if (base && base !== current.slug) {
      slug = await resolveUniqueSlug(base, id);
    }
  }

  const record = await prisma.category.update({
    where: { id },
    data: {
      name: input.name?.trim() ?? current.name,
      slug,
      description: input.description !== undefined ? input.description.trim() : current.description,
    },
  });
  return toDomain(record);
}

export async function deleteCategory(id: number): Promise<boolean> {
  try {
    await prisma.category.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
