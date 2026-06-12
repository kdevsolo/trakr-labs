-- CreateEnum
CREATE TYPE "UserInviteStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- CreateTable
CREATE TABLE "UserInvite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "status" "UserInviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserInvite_userId_key" ON "UserInvite"("userId");

-- CreateIndex
CREATE INDEX "UserInvite_orgId_idx" ON "UserInvite"("orgId");

-- CreateIndex
CREATE INDEX "UserInvite_status_idx" ON "UserInvite"("status");

-- AddForeignKey
ALTER TABLE "UserInvite" ADD CONSTRAINT "UserInvite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
