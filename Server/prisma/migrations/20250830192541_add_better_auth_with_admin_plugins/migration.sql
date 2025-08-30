-- AlterTable
ALTER TABLE `session` ADD COLUMN `impersonatedBy` TEXT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `banExpires` DATETIME(3) NULL,
    ADD COLUMN `banReason` TEXT NULL,
    ADD COLUMN `banned` BOOLEAN NULL,
    ADD COLUMN `role` TEXT NULL;
