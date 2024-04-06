-- DropIndex
DROP INDEX `User_roleId_fkey` ON `user`;

-- CreateTable
CREATE TABLE `Stats_web` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `count` INTEGER NOT NULL,
    `page` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stats_Api` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `totalRequests` INTEGER NOT NULL,
    `averageResponseTime` DOUBLE NOT NULL,
    `statusCodeCounts` JSON NOT NULL,
    `averageResponseSize` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
