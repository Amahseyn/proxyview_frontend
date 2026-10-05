-- CreateTable
CREATE TABLE "posts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'Guides',
    "author" TEXT NOT NULL DEFAULT 'wm',
    "date" TEXT NOT NULL DEFAULT '',
    "thumbnail" TEXT NOT NULL DEFAULT '',
    "url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE INDEX "posts_category_idx" ON "posts"("category");
