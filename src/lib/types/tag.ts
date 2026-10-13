export interface Tag {
  id: number;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TagInput {
  name: string;
  slug?: string;
}
