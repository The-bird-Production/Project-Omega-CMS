-- CreateTable
CREATE TABLE `customFont` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `family` VARCHAR(191) NOT NULL,
    `file` VARCHAR(191) NOT NULL,
    `weight` VARCHAR(191) NOT NULL DEFAULT '400',
    `style` VARCHAR(191) NOT NULL DEFAULT 'normal',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `customFont_family_idx`(`family`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
