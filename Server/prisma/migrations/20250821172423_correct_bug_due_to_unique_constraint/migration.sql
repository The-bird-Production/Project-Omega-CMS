/*
  Warnings:

  - A unique constraint covering the columns `[draftId]` on the table `articleSaved` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `articleSaved_draftId_key` ON `articleSaved`(`draftId`);
