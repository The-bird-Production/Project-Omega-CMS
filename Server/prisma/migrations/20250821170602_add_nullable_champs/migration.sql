-- AlterTable
ALTER TABLE `articlesaved` MODIFY `title` VARCHAR(191) NULL,
    MODIFY `slug` VARCHAR(191) NULL,
    MODIFY `body` TEXT NULL,
    MODIFY `publishedAt` DATETIME(3) NULL;
