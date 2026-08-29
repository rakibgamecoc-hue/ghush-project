-- Baseline only: this schema already exists in production. It is marked as
-- applied so Prisma can safely deploy later migrations.
CREATE TYPE "Outcome" AS ENUM ('PAID', 'REJECTED', 'PENDING');

CREATE TABLE "BribeReport" (
    "id" TEXT NOT NULL,
    "departmentCategory" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "stateRegion" TEXT NOT NULL,
    "districtLocation" TEXT NOT NULL,
    "amountDemanded" DECIMAL(10,2) NOT NULL,
    "outcome" "Outcome" NOT NULL,
    "narrativeText" TEXT NOT NULL,
    "verificationStatus" TEXT NOT NULL DEFAULT 'Unverified',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BribeReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BribeReport_stateRegion_idx" ON "BribeReport"("stateRegion");
CREATE INDEX "BribeReport_departmentCategory_idx" ON "BribeReport"("departmentCategory");
CREATE INDEX "BribeReport_outcome_idx" ON "BribeReport"("outcome");
CREATE INDEX "BribeReport_createdAt_idx" ON "BribeReport"("createdAt");
CREATE INDEX "BribeReport_amountDemanded_idx" ON "BribeReport"("amountDemanded");
