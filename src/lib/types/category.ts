export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryInput {
  name: string;
  slug?: string;
  description?: string;
}
