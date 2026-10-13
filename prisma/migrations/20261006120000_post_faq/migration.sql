-- Post-level FAQ (section title + Q&A pairs stored as JSON)
ALTER TABLE "posts" ADD COLUMN "faq_json" TEXT NOT NULL DEFAULT '';
