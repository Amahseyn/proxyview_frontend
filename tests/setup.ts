import { afterAll, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';

beforeEach(async () => {
  await prisma.glossaryTerm.deleteMany();
  await prisma.glossaryPageConfig.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.post.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
