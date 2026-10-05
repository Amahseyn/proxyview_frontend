import { PrismaClient } from '@prisma/client';
import { blogPosts } from '../src/lib/data/blogPosts';

const prisma = new PrismaClient();

async function main() {
  let created = 0;
  let updated = 0;

  for (const post of blogPosts) {
    const existing = await prisma.post.findUnique({ where: { slug: post.slug } });

    if (existing) {
      await prisma.post.update({
        where: { slug: post.slug },
        data: {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          author: post.author,
          date: post.date,
          thumbnail: post.thumbnail,
          url: post.url ?? `/blog/${post.slug}`,
        },
      });
      updated++;
      console.log(`Updated: ${post.slug}`);
    } else {
      await prisma.post.create({
        data: {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          author: post.author,
          date: post.date,
          thumbnail: post.thumbnail,
          url: post.url ?? `/blog/${post.slug}`,
        },
      });
      created++;
      console.log(`Created: ${post.slug}`);
    }
  }

  const stale = await prisma.post.findMany({
    where: { slug: { notIn: blogPosts.map(p => p.slug) } },
    select: { slug: true, title: true },
  });

  if (stale.length > 0) {
    console.log('\nPosts in database not in blogPosts.ts (left unchanged):');
    for (const post of stale) {
      console.log(`  - ${post.slug}: ${post.title}`);
    }
  }

  console.log(`\nDone. ${created} created, ${updated} updated.`);
}

main()
  .catch(error => {
    console.error('Sync failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
