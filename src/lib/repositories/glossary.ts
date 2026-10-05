import type { GlossaryPageConfig as PrismaGlossaryPageConfig, GlossaryTerm as PrismaGlossaryTerm } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { DEFAULT_GLOSSARY_HERO } from '@/lib/data/glossaryTerms';
import { prisma } from '@/lib/prisma';
import type {
  GlossaryPageConfig,
  GlossaryPageConfigInput,
  GlossaryPageContent,
  GlossaryTerm,
  GlossaryTermInput,
} from '@/lib/types/glossary';

function toTerm(record: PrismaGlossaryTerm): GlossaryTerm {
  return {
    id: record.id,
    term: record.term,
    definition: record.definition,
    sortOrder: record.sortOrder,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function toConfig(record: PrismaGlossaryPageConfig): GlossaryPageConfig {
  return {
    id: record.id,
    heroTitle: record.heroTitle,
    heroSubtitle: record.heroSubtitle,
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function ensurePageConfig(): Promise<GlossaryPageConfig> {
  const record = await prisma.glossaryPageConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      heroTitle: DEFAULT_GLOSSARY_HERO.heroTitle,
      heroSubtitle: DEFAULT_GLOSSARY_HERO.heroSubtitle,
    },
  });

  return toConfig(record);
}

export async function getGlossaryPageContent(): Promise<GlossaryPageContent> {
  const [config, records] = await Promise.all([
    ensurePageConfig(),
    prisma.glossaryTerm.findMany({ orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] }),
  ]);

  return {
    config,
    terms: records.map(toTerm),
  };
}

export async function getAllGlossaryTerms(): Promise<GlossaryTerm[]> {
  const records = await prisma.glossaryTerm.findMany({ orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] });
  return records.map(toTerm);
}

export async function findGlossaryTerm(id: number | string): Promise<GlossaryTerm | undefined> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) return undefined;

  const record = await prisma.glossaryTerm.findUnique({ where: { id: numericId } });
  return record ? toTerm(record) : undefined;
}

export async function createGlossaryTerm(data: GlossaryTermInput): Promise<GlossaryTerm> {
  let sortOrder = data.sortOrder;
  if (sortOrder === undefined) {
    const last = await prisma.glossaryTerm.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    sortOrder = (last?.sortOrder ?? -1) + 1;
  }

  const record = await prisma.glossaryTerm.create({
    data: {
      term: data.term.trim(),
      definition: data.definition.trim(),
      sortOrder,
    },
  });

  return toTerm(record);
}

export async function updateGlossaryTerm(
  id: number | string,
  updateData: Partial<GlossaryTermInput>
): Promise<GlossaryTerm | null> {
  const current = await findGlossaryTerm(id);
  if (!current) return null;

  try {
    const record = await prisma.glossaryTerm.update({
      where: { id: current.id },
      data: {
        term: updateData.term?.trim() ?? current.term,
        definition: updateData.definition?.trim() ?? current.definition,
        sortOrder: updateData.sortOrder ?? current.sortOrder,
      },
    });

    return toTerm(record);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return null;
    }
    throw error;
  }
}

export async function deleteGlossaryTerm(id: number | string): Promise<GlossaryTerm | false> {
  const current = await findGlossaryTerm(id);
  if (!current) return false;

  try {
    await prisma.glossaryTerm.delete({ where: { id: current.id } });
    return current;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return false;
    }
    throw error;
  }
}

export async function updateGlossaryPageConfig(
  updateData: GlossaryPageConfigInput
): Promise<GlossaryPageConfig> {
  const record = await prisma.glossaryPageConfig.upsert({
    where: { id: 1 },
    update: {
      heroTitle: updateData.heroTitle.trim(),
      heroSubtitle: updateData.heroSubtitle.trim(),
    },
    create: {
      id: 1,
      heroTitle: updateData.heroTitle.trim(),
      heroSubtitle: updateData.heroSubtitle.trim(),
    },
  });

  return toConfig(record);
}

export async function getGlossaryPageConfig(): Promise<GlossaryPageConfig> {
  return ensurePageConfig();
}
