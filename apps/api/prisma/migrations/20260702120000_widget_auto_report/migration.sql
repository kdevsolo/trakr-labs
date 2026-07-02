-- AlterTable
ALTER TABLE "Project" ADD COLUMN "widgetAutoCrashReport" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Project" ADD COLUMN "widgetAutoNetworkReport" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Issue_projectId_metadata_fingerprint_idx" ON "Issue" ("projectId", ((metadata->>'fingerprint')));
