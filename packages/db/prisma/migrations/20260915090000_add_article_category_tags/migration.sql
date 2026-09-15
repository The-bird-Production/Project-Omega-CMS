-- AlterTable
ALTER TABLE `article` ADD COLUMN `category` VARCHAR(191) NULL,
    ADD COLUMN `tags` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `article_category_idx` ON `article`(`category`);

