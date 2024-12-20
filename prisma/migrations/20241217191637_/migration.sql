/*
  Warnings:

  - You are about to drop the column `dateSent` on the `EmailMessage` table. All the data in the column will be lost.
  - You are about to drop the column `dateSent` on the `SMSMessage` table. All the data in the column will be lost.
  - Changed the type of `status` on the `EmailMessage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `status` to the `SMSMessage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('RECEIVED', 'SENT', 'PENDING');

-- AlterTable
ALTER TABLE "EmailMessage" DROP COLUMN "dateSent",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL;

-- AlterTable
ALTER TABLE "SMSMessage" DROP COLUMN "dateSent",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "Status" NOT NULL;
