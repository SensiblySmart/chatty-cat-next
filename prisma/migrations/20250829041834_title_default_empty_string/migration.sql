/*
  Warnings:

  - Made the column `title` on table `conversations` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."conversations" ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "title" SET DEFAULT '';
