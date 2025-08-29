/*
  Warnings:

  - You are about to drop the column `access_token` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `id_token` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `providerAccountId` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token_expires_in` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `session_state` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `token_type` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `expires` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `sessionToken` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `article` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `articlesaved` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `authenticator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `file` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `log` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `page` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `redirect` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stats_api` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stats_web` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verificationtoken` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[token]` on the table `session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountId` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerId` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `session` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `emailVerified` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `account` DROP FOREIGN KEY `Account_userId_fkey`;

-- DropForeignKey
ALTER TABLE `authenticator` DROP FOREIGN KEY `Authenticator_userId_fkey`;

-- DropForeignKey
ALTER TABLE `session` DROP FOREIGN KEY `Session_userId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_roleId_fkey`;

-- DropIndex
DROP INDEX `Account_provider_providerAccountId_key` ON `account`;

-- DropIndex
DROP INDEX `Account_userId_idx` ON `account`;

-- DropIndex
DROP INDEX `Account_userId_key` ON `account`;

-- DropIndex
DROP INDEX `Session_sessionToken_key` ON `session`;

-- DropIndex
DROP INDEX `Session_userId_idx` ON `session`;

-- DropIndex
DROP INDEX `User_password_key` ON `user`;

-- DropIndex
DROP INDEX `User_roleId_fkey` ON `user`;

-- DropIndex
DROP INDEX `User_username_key` ON `user`;

-- AlterTable
ALTER TABLE `account` DROP COLUMN `access_token`,
    DROP COLUMN `expires_at`,
    DROP COLUMN `id_token`,
    DROP COLUMN `provider`,
    DROP COLUMN `providerAccountId`,
    DROP COLUMN `refresh_token`,
    DROP COLUMN `refresh_token_expires_in`,
    DROP COLUMN `session_state`,
    DROP COLUMN `token_type`,
    DROP COLUMN `type`,
    ADD COLUMN `accessToken` TEXT NULL,
    ADD COLUMN `accessTokenExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `accountId` TEXT NOT NULL,
    ADD COLUMN `idToken` TEXT NULL,
    ADD COLUMN `password` TEXT NULL,
    ADD COLUMN `providerId` TEXT NOT NULL,
    ADD COLUMN `refreshToken` TEXT NULL,
    ADD COLUMN `refreshTokenExpiresAt` DATETIME(3) NULL,
    MODIFY `scope` TEXT NULL,
    ALTER COLUMN `createdAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `session` DROP COLUMN `expires`,
    DROP COLUMN `sessionToken`,
    ADD COLUMN `expiresAt` DATETIME(3) NOT NULL,
    ADD COLUMN `ipAddress` TEXT NULL,
    ADD COLUMN `token` VARCHAR(191) NOT NULL,
    ADD COLUMN `userAgent` TEXT NULL,
    ALTER COLUMN `createdAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `password`,
    DROP COLUMN `roleId`,
    DROP COLUMN `username`,
    MODIFY `name` TEXT NOT NULL,
    MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `emailVerified` BOOLEAN NOT NULL,
    MODIFY `image` TEXT NULL,
    ALTER COLUMN `createdAt` DROP DEFAULT;

-- DropTable
DROP TABLE `article`;

-- DropTable
DROP TABLE `articlesaved`;

-- DropTable
DROP TABLE `authenticator`;

-- DropTable
DROP TABLE `file`;

-- DropTable
DROP TABLE `image`;

-- DropTable
DROP TABLE `log`;

-- DropTable
DROP TABLE `page`;

-- DropTable
DROP TABLE `redirect`;

-- DropTable
DROP TABLE `role`;

-- DropTable
DROP TABLE `stats_api`;

-- DropTable
DROP TABLE `stats_web`;

-- DropTable
DROP TABLE `verificationtoken`;

-- CreateTable
CREATE TABLE `verification` (
    `id` VARCHAR(191) NOT NULL,
    `identifier` TEXT NOT NULL,
    `value` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `session_token_key` ON `session`(`token`);

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `account` ADD CONSTRAINT `account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `User_email_key` TO `user_email_key`;
