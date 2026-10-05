-- CreateTable
CREATE TABLE "glossary_page_config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "hero_title" TEXT NOT NULL DEFAULT 'Proxy Glossary',
    "hero_subtitle" TEXT NOT NULL DEFAULT 'Key terms and definitions in the proxy, anti-detect, and web scraping industry.',
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "glossary_terms" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "term" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "glossary_terms_sort_order_idx" ON "glossary_terms"("sort_order");
