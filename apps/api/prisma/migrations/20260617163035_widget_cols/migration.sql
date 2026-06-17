-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "widgetEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "widgetSecretHash" TEXT;
