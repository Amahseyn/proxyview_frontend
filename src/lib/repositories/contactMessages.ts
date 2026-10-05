import type { ContactMessage as PrismaContactMessage } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { ContactMessage, ContactMessageInput } from '@/lib/types/contact';

function toDomain(record: PrismaContactMessage): ContactMessage {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    subject: record.subject,
    message: record.message,
    createdAt: record.createdAt.toISOString(),
  };
}

export async function createContactMessage(input: ContactMessageInput): Promise<ContactMessage> {
  const record = await prisma.contactMessage.create({
    data: {
      name: input.name.trim(),
      email: input.email.trim(),
      subject: input.subject?.trim() || '',
      message: input.message.trim(),
    },
  });

  return toDomain(record);
}

export async function getAllContactMessages(): Promise<ContactMessage[]> {
  const records = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
  return records.map(toDomain);
}

export async function findContactMessage(id: number): Promise<ContactMessage | undefined> {
  const record = await prisma.contactMessage.findUnique({ where: { id } });
  return record ? toDomain(record) : undefined;
}

export async function deleteContactMessage(id: number): Promise<ContactMessage | false> {
  const current = await findContactMessage(id);
  if (!current) return false;

  try {
    await prisma.contactMessage.delete({ where: { id } });
    return current;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return false;
    }
    throw error;
  }
}
