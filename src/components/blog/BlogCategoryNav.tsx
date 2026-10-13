import Link from 'next/link';
import { BLOG_CATEGORIES, blogCategoryPath } from '@/lib/seo/categories';

type Props = {
  activeCategory?: string;
};

export default function BlogCategoryNav({ activeCategory }: Props) {
  const showAllActive = !activeCategory;

  return (
    <nav className="blog-category-nav" aria-label="Blog categories">
      <ul className="blog-category-nav-list">
        <li>
          <Link
            href="/blog"
            className={`blog-category-nav-btn${showAllActive ? ' blog-category-nav-btn--active' : ''}`}
            aria-current={showAllActive ? 'page' : undefined}
          >
            All
          </Link>
        </li>
        {BLOG_CATEGORIES.map(({ slug, name }) => {
          const isActive = activeCategory === name;
          return (
            <li key={slug}>
              <Link
                href={blogCategoryPath(slug)}
                className={`blog-category-nav-btn${isActive ? ' blog-category-nav-btn--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
