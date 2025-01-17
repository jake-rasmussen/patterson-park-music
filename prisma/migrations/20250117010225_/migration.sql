/*
  Warnings:

  - Added the required column `isParent` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "USER_TYPE" AS ENUM ('PARENT', 'STUDENT', 'TEACHER');

-- AlterTable
ALTER TABLE "EmailMessage" ADD COLUMN     "errorCode" INTEGER;

-- AlterTable
ALTER TABLE "SMSMessage" ADD COLUMN     "errorCode" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "familyId" TEXT,
ADD COLUMN     "isParent" BOOLEAN NOT NULL;

-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "campus" TEXT NOT NULL,
    "doorCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;
