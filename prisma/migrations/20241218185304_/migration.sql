/*
  Warnings:

  - You are about to drop the column `messageSid` on the `SMSMessage` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "SMSMessage_messageSid_key";

-- AlterTable
ALTER TABLE "SMSMessage" DROP COLUMN "messageSid";

-- CreateTable
CREATE TABLE "FutureSMSMessage" (
    "id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "mediaUrls" TEXT[],
    "status" "Status" NOT NULL,
    "days" "WEEKDAY"[],
    "date" TIMESTAMP(3),

    CONSTRAINT "FutureSMSMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FutureEmailMessage" (
    "id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT[],
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "cc" TEXT[],
    "bcc" TEXT[],
    "attachments" TEXT[],
    "status" "Status" NOT NULL,
    "days" "WEEKDAY"[],
    "date" TIMESTAMP(3),

    CONSTRAINT "FutureEmailMessage_pkey" PRIMARY KEY ("id")
);
