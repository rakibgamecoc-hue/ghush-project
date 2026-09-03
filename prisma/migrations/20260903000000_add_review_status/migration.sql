CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "BribeReport" ADD COLUMN "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'PENDING';

-- Backfill existing rows as APPROVED so historical reports remain visible after the approval gate.
UPDATE "BribeReport" SET "reviewStatus" = 'APPROVED';

CREATE INDEX "BribeReport_reviewStatus_createdAt_idx" ON "BribeReport"("reviewStatus", "createdAt");
