/*
  Warnings:

  - Added the required column `draftId` to the `articleSaved` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `articlesaved` ADD COLUMN `draftId` VARCHAR(191) NOT NULL;
