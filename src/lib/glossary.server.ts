import 'server-only';

import type { GlossaryPageContent } from '@/lib/types/glossary';
import { getGlossaryPageContent as repoGetGlossaryPageContent } from '@/lib/repositories/glossary';

export type { GlossaryPageContent, GlossaryTerm, GlossaryPageConfig } from '@/lib/types/glossary';

export async function getGlossaryPageContent(): Promise<GlossaryPageContent> {
  return repoGetGlossaryPageContent();
}
