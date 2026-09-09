export interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  thumbnail: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostInput {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  category?: string;
  author?: string;
  date?: string;
  thumbnail?: string;
}
