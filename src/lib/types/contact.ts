export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface ContactMessageInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
}
