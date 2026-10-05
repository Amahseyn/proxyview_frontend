import { PrismaClient } from '@prisma/client';
import { blogPosts } from '../src/lib/data/blogPosts';
import { DEFAULT_GLOSSARY_HERO, glossaryTerms } from '../src/lib/data/glossaryTerms';

const prisma = new PrismaClient();

async function main() {
  const postCount = await prisma.post.count();
  if (postCount === 0) {
    for (const post of blogPosts) {
      await prisma.post.create({
        data: {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt || '',
          content: post.content || '',
          category: post.category || 'Guides',
          author: post.author || 'wm',
          date: post.date || '',
          thumbnail: post.thumbnail || '/images/blog/web-scraping.jpg',
          url: post.url || `/blog/${post.slug}`,
          status: 'published',
        },
      });
    }
    console.log(`Seeded ${blogPosts.length} posts.`);
  } else {
    console.log(`Database already has ${postCount} posts — skipping post seed.`);
  }

  await prisma.glossaryPageConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      heroTitle: DEFAULT_GLOSSARY_HERO.heroTitle,
      heroSubtitle: DEFAULT_GLOSSARY_HERO.heroSubtitle,
    },
  });

  const glossaryCount = await prisma.glossaryTerm.count();
  if (glossaryCount === 0) {
    for (const [index, item] of glossaryTerms.entries()) {
      await prisma.glossaryTerm.create({
        data: {
          term: item.term,
          definition: item.definition,
          sortOrder: index,
        },
      });
    }
    console.log(`Seeded ${glossaryTerms.length} glossary terms.`);
  } else {
    console.log(`Database already has ${glossaryCount} glossary terms — skipping glossary seed.`);
  }
}

main()
  .catch(error => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
