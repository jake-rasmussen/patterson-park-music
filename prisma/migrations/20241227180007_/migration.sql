/*
  Warnings:

  - You are about to drop the column `semester` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `weekday` on the `Section` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Section" DROP COLUMN "semester",
DROP COLUMN "weekday",
ADD COLUMN     "semesters" "SEMESTER"[],
ADD COLUMN     "weekdays" "WEEKDAY"[];
