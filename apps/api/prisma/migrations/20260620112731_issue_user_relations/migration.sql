-- CreateIndex
CREATE INDEX "Issue_reportedBy_idx" ON "Issue"("reportedBy");

-- CreateIndex
CREATE INDEX "Issue_assignedTo_idx" ON "Issue"("assignedTo");

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
