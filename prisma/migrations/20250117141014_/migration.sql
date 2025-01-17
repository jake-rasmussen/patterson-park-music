/*
  Warnings:

  - You are about to drop the column `isParent` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isTeacher` on the `User` table. All the data in the column will be lost.
  - Added the required column `type` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isParent",
DROP COLUMN "isTeacher",
ADD COLUMN     "type" "USER_TYPE" NOT NULL;
