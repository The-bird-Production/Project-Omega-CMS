-- Old stats_api rows stored process-lifetime CUMULATIVE counters (one row
-- per request, but holding running totals since server start rather than a
-- per-request measurement) — there is no meaningful historical data to
-- carry forward into the new per-request shape, so this replaces the table
-- outright instead of ALTERing NOT NULL columns onto it with fabricated
-- backfill values.
DROP TABLE `stats_api`;

-- CreateTable
CREATE TABLE `stats_api` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `method` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `statusCode` INTEGER NOT NULL,
    `responseTime` DOUBLE NOT NULL,
    `responseSize` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `stats_api_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `stats_web` MODIFY `count` INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX `stats_web_date_idx` ON `stats_web`(`date`);

-- CreateIndex
CREATE INDEX `stats_web_page_idx` ON `stats_web`(`page`);
