/*
  Warnings:

  - You are about to drop the column `messageId` on the `EmailMessage` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "EmailMessage_messageId_key";

-- AlterTable
ALTER TABLE "EmailMessage" DROP COLUMN "messageId";
