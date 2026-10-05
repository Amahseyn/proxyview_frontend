-- AlterTable
ALTER TABLE "posts" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'published';
ALTER TABLE "posts" ADD COLUMN "scheduled_at" DATETIME;

-- CreateIndex
CREATE INDEX "posts_status_idx" ON "posts"("status");
CREATE INDEX "posts_scheduled_at_idx" ON "posts"("scheduled_at");
