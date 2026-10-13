-- CreateTable
CREATE TABLE "categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tags" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "post_categories" (
    "post_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    PRIMARY KEY ("post_id", "category_id"),
    CONSTRAINT "post_categories_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "post_tags" (
    "post_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    PRIMARY KEY ("post_id", "tag_id"),
    CONSTRAINT "post_tags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- AlterTable
ALTER TABLE "posts" ADD COLUMN "blocks_json" TEXT NOT NULL DEFAULT '';
ALTER TABLE "posts" ADD COLUMN "canonical_url" TEXT NOT NULL DEFAULT '';
ALTER TABLE "posts" ADD COLUMN "og_image" TEXT NOT NULL DEFAULT '';
ALTER TABLE "posts" ADD COLUMN "seo_no_index" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- Seed default categories
INSERT INTO "categories" ("name", "slug", "description", "updated_at") VALUES
  ('Guides', 'guides', 'How-to guides and tutorials', CURRENT_TIMESTAMP),
  ('Comparisons', 'comparisons', 'Side-by-side provider comparisons', CURRENT_TIMESTAMP),
  ('Research', 'research', 'In-depth research articles', CURRENT_TIMESTAMP),
  ('Reviews', 'reviews', 'Product and service reviews', CURRENT_TIMESTAMP),
  ('News', 'news', 'Industry news and updates', CURRENT_TIMESTAMP);
