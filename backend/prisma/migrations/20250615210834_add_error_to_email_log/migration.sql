/*
  Warnings:

  - You are about to drop the column `attemptCount` on the `EmailLog` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `EmailLog` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `EmailLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "EmailLog" DROP COLUMN "attemptCount",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "error" TEXT,
ADD COLUMN     "templateData" JSONB,
ADD COLUMN     "templateName" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "sentAt" DROP NOT NULL,
ALTER COLUMN "sentAt" DROP DEFAULT,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;
