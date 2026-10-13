-- Post-level table of contents (section title + entries stored as JSON)
ALTER TABLE "posts" ADD COLUMN "toc_json" TEXT NOT NULL DEFAULT '';
