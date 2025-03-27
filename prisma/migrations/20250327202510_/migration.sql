/*
  Warnings:

  - Changed the type of `campus` on the `Family` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `campus` to the `Section` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CAMPUS" AS ENUM ('PPAM', 'SOBO');

-- AlterEnum
ALTER TYPE "USER_TYPE" ADD VALUE 'UNKNOWN';

-- AlterTable
ALTER TABLE "EmailMessage" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Family" DROP COLUMN "campus",
ADD COLUMN     "campus" "CAMPUS" NOT NULL;

-- AlterTable
ALTER TABLE "SMSMessage" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "campus" "CAMPUS" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthday" TIMESTAMP(3),
ADD COLUMN     "hasMessage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "interests" "COURSE"[],
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pronouns" TEXT,
ADD COLUMN     "school" "CAMPUS",
ADD COLUMN     "unreadMessage" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "phoneNumber" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "SMSMessage" ADD CONSTRAINT "SMSMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
