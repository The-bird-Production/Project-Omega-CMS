-- AlterTable
ALTER TABLE `stats_web` ADD COLUMN `browser` VARCHAR(191) NULL,
    ADD COLUMN `device` VARCHAR(191) NULL,
    ADD COLUMN `referrer` VARCHAR(191) NULL,
    ADD COLUMN `visitorId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `stats_web_visitorId_idx` ON `stats_web`(`visitorId`);
