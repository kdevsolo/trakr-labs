-- CreateIndex
CREATE INDEX "Issue_projectId_createdAt_idx" ON "Issue"("projectId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Issue_projectId_statusId_idx" ON "Issue"("projectId", "statusId");

-- CreateIndex
CREATE INDEX "Comment_issueId_createdAt_idx" ON "Comment"("issueId", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectMember_projectId_idx" ON "ProjectMember"("projectId");

-- CreateIndex
CREATE INDEX "StatusMaster_orgId_idx" ON "StatusMaster"("orgId");
