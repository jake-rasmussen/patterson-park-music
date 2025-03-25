/*
  Warnings:

  - You are about to drop the column `personId` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the `Contact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Family` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Person` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SEMESTER" AS ENUM ('SPRING', 'SUMMER', 'FALL', 'WINTER');

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_personId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_personId_fkey";

-- DropForeignKey
ALTER TABLE "Person" DROP CONSTRAINT "Person_familyId_fkey";

-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_teacherId_fkey";

-- AlterTable
ALTER TABLE "Enrollment" DROP COLUMN "personId",
ADD COLUMN     "userId" TEXT;

-- DropTable
DROP TABLE "Contact";

-- DropTable
DROP TABLE "Family";

-- DropTable
DROP TABLE "Person";

-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "isTeacher" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
