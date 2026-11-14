import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Target category names for each post slug
const targetCategoryBySlug: Record<string, string> = {
  'what-is-web-scraping': 'Guides',
  'how-to-get-around-an-ip-ban': 'Guides',
  'web-telegram-login-and-features': 'Guides',
  'how-researchers-use-proxies-for-research-and-web-scraping': 'Research',
  'what-is-the-use-case-of-a-proxy': 'Guides',
  'proxy-types-explained': 'Guides',
  'residential-vs-datacenter-proxies': 'Comparisons',
  'how-to-test-if-your-proxy-is-working': 'Guides',
  'best-reddit-proxies-providers-compared': 'Comparisons',
  'how-can-you-have-multiple-reddit-accounts': 'Guides',
  'reddit-shadowban-signs-checks-and-the-appeal-process': 'Guides',
  'full-research-on-web-scraping-challenges-access-data-quality-and-costs': 'Research',
  'best-telegram-proxies-providers-pricing-and-setup-compared': 'Comparisons',
  'best-facebook-proxies-for-agencies-and-media-buyers': 'Comparisons',
};

async function main() {
  console.log('Fetching existing categories...');
  const allCategories = await prisma.category.findMany();
  const categoryByName = new Map<string, typeof allCategories[0]>();
  for (const cat of allCategories) {
    categoryByName.set(cat.name.toLowerCase(), cat);
  }

  console.log(`Found ${allCategories.length} categories in database:`, allCategories.map(c => `${c.name} (#${c.id})`).join(', '));

  const posts = await prisma.post.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      categories: { select: { categoryId: true, category: { select: { name: true } } } },
    },
    orderBy: { id: 'asc' },
  });

  console.log(`\nReviewing ${posts.length} posts...`);

  for (const post of posts) {
    const targetCategoryName = targetCategoryBySlug[post.slug] || post.category;
    const categoryRecord = categoryByName.get(targetCategoryName.toLowerCase());

    if (!categoryRecord) {
      console.warn(`[WARNING] No category record found for "${targetCategoryName}" (post #${post.id} ${post.slug})`);
      continue;
    }

    const currentCatString = post.category;
    const currentLinkedCategoryIds = post.categories.map(c => c.categoryId);
    const needsPostUpdate = currentCatString !== categoryRecord.name;
    const needsLinkUpdate = !currentLinkedCategoryIds.includes(categoryRecord.id) || currentLinkedCategoryIds.length !== 1;

    if (needsPostUpdate) {
      await prisma.post.update({
        where: { id: post.id },
        data: { category: categoryRecord.name },
      });
      console.log(`[UPDATED] Post #${post.id} (${post.slug}): "${currentCatString}" -> "${categoryRecord.name}"`);
    } else {
      console.log(`[UNCHANGED] Post #${post.id} (${post.slug}): already "${categoryRecord.name}"`);
    }

    if (needsLinkUpdate) {
      await prisma.postCategory.deleteMany({ where: { postId: post.id } });
      await prisma.postCategory.create({
        data: {
          postId: post.id,
          categoryId: categoryRecord.id,
        },
      });
      console.log(`  -> Synced post_categories link: post #${post.id} -> category #${categoryRecord.id} (${categoryRecord.name})`);
    }
  }

  console.log('\n=== Summary of Categories after Fix ===');
  const postCounts = await prisma.post.groupBy({
    by: ['category'],
    _count: { id: true },
  });
  for (const row of postCounts) {
    console.log(`  ${row.category}: ${row._count.id} posts`);
  }
}

main()
  .catch(err => {
    console.error('Error running category fix:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

