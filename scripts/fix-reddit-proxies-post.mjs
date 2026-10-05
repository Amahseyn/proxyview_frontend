import { PrismaClient } from '@prisma/client';
import { normalizeBlogPostHtml } from '../src/lib/richTextTable.ts';

const SLUG = 'best-reddit-proxies-providers-compared';

const prisma = new PrismaClient();

async function main() {
  const post = await prisma.post.findUnique({ where: { slug: SLUG } });
  if (!post) {
    console.error('Post not found:', SLUG);
    process.exit(1);
  }

  const beforeFc = (post.content.match(/#fcfcfc/gi) || []).length;
  const beforeTable = post.content.match(/<table[\s\S]*?<\/table>/i)?.[0] ?? '';
  const cleaned = normalizeBlogPostHtml(post.content);
  const afterFc = (cleaned.match(/#fcfcfc/gi) || []).length;

  if (cleaned === post.content) {
    console.log('No changes needed.');
    return;
  }

  await prisma.post.update({
    where: { id: post.id },
    data: { content: cleaned },
  });

  console.log('Updated post', SLUG);
  console.log('Content length:', post.content.length, '->', cleaned.length);
  console.log('#fcfcfc occurrences:', beforeFc, '->', afterFc);
  console.log('Table rebuilt:', beforeTable.length, '->', (cleaned.match(/<table[\s\S]*?<\/table>/i)?.[0] ?? '').length);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
