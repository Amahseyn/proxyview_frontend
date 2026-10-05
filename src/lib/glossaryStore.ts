import type {
  GlossaryPageConfig,
  GlossaryPageConfigInput,
  GlossaryPageContent,
  GlossaryTerm,
  GlossaryTermInput,
} from '@/lib/types/glossary';
import {
  createGlossaryTerm as repoCreateGlossaryTerm,
  deleteGlossaryTerm as repoDeleteGlossaryTerm,
  findGlossaryTerm as repoFindGlossaryTerm,
  getAllGlossaryTerms as repoGetAllGlossaryTerms,
  getGlossaryPageConfig as repoGetGlossaryPageConfig,
  getGlossaryPageContent as repoGetGlossaryPageContent,
  updateGlossaryPageConfig as repoUpdateGlossaryPageConfig,
  updateGlossaryTerm as repoUpdateGlossaryTerm,
} from '@/lib/repositories/glossary';

export function getGlossaryPageContent(): Promise<GlossaryPageContent> {
  return repoGetGlossaryPageContent();
}

export function getAllGlossaryTerms(): Promise<GlossaryTerm[]> {
  return repoGetAllGlossaryTerms();
}

export function findGlossaryTerm(id: number | string): Promise<GlossaryTerm | undefined> {
  return repoFindGlossaryTerm(id);
}

export function createGlossaryTerm(data: GlossaryTermInput): Promise<GlossaryTerm> {
  return repoCreateGlossaryTerm(data);
}

export function updateGlossaryTerm(
  id: number | string,
  updateData: Partial<GlossaryTermInput>
): Promise<GlossaryTerm | null> {
  return repoUpdateGlossaryTerm(id, updateData);
}

export function deleteGlossaryTerm(id: number | string): Promise<GlossaryTerm | false> {
  return repoDeleteGlossaryTerm(id);
}

export function getGlossaryPageConfig(): Promise<GlossaryPageConfig> {
  return repoGetGlossaryPageConfig();
}

export function updateGlossaryPageConfig(updateData: GlossaryPageConfigInput): Promise<GlossaryPageConfig> {
  return repoUpdateGlossaryPageConfig(updateData);
}
