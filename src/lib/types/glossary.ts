export interface GlossaryTerm {
  id: number;
  term: string;
  definition: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface GlossaryTermInput {
  term: string;
  definition: string;
  sortOrder?: number;
}

export interface GlossaryPageConfig {
  id: number;
  heroTitle: string;
  heroSubtitle: string;
  updatedAt: string;
}

export interface GlossaryPageConfigInput {
  heroTitle: string;
  heroSubtitle: string;
}

export interface GlossaryPageContent {
  config: GlossaryPageConfig;
  terms: GlossaryTerm[];
}
