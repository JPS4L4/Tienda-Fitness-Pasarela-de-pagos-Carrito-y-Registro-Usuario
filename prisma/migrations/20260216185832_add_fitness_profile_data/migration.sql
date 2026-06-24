/*
  Warnings:

  - You are about to drop the `Resource` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Resource" DROP CONSTRAINT "Resource_planId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "equipmentAvailability" TEXT,
ADD COLUMN     "fitnessProfileCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "goal" TEXT,
ADD COLUMN     "healthCondition" TEXT,
ADD COLUMN     "heightCm" DOUBLE PRECISION,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "trainingTime" TEXT,
ADD COLUMN     "weightKg" DOUBLE PRECISION;

-- DropTable
DROP TABLE "Resource";

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
