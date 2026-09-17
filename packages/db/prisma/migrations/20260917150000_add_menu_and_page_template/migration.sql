-- AlterTable
ALTER TABLE `page` ADD COLUMN `template` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `menuItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `menu` VARCHAR(191) NOT NULL DEFAULT 'main',
    `label` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `target` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `parentId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `menuItem_menu_idx`(`menu`),
    INDEX `menuItem_parentId_idx`(`parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `menuItem` ADD CONSTRAINT `menuItem_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `menuItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
