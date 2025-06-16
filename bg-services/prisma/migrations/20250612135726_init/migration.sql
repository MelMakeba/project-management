-- AlterTable
ALTER TABLE "EmailLog" ADD COLUMN     "templateData" JSONB,
ADD COLUMN     "templateName" TEXT;
