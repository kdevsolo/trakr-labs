/*
  Warnings:

  - The values [ISSUE,COMMENT,ISSUE_MEDIA] on the enum `PermissionResource` will be removed.
    Existing `MemberPermission` rows referencing these resources are deleted first, since
    issues and comments now inherit access from their parent project's PROJECT permission.

*/
-- Remove grants for resources that no longer exist
DELETE FROM "MemberPermission" WHERE "resource" IN ('ISSUE', 'COMMENT', 'ISSUE_MEDIA');

-- AlterEnum
BEGIN;
CREATE TYPE "PermissionResource_new" AS ENUM ('PROJECT', 'USER');
ALTER TABLE "MemberPermission" ALTER COLUMN "resource" TYPE "PermissionResource_new" USING ("resource"::text::"PermissionResource_new");
ALTER TYPE "PermissionResource" RENAME TO "PermissionResource_old";
ALTER TYPE "PermissionResource_new" RENAME TO "PermissionResource";
DROP TYPE "PermissionResource_old";
COMMIT;
