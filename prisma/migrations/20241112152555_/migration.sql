/*
  Warnings:

  - You are about to drop the column `email` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `Person` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Person" DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "phoneNumber";

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "personId" TEXT,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contact_personId_key" ON "Contact"("personId");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;
