-- AlterTable: page — drop the global slug-unique, add locale with a
-- (slug, locale) compound unique instead. DEFAULT 'fr' means every
-- existing row becomes a French page with no data loss, and since slug
-- was already globally unique, (slug, 'fr') stays unique automatically.
ALTER TABLE `page` ADD COLUMN `locale` VARCHAR(191) NOT NULL DEFAULT 'fr';
ALTER TABLE `page` DROP INDEX `Page_slug_key`;
CREATE UNIQUE INDEX `Page_slug_locale_key` ON `page`(`slug`, `locale`);

-- AlterTable: article — same reasoning, for both of its unique columns.
ALTER TABLE `article` ADD COLUMN `locale` VARCHAR(191) NOT NULL DEFAULT 'fr';
ALTER TABLE `article` DROP INDEX `Article_slug_key`;
ALTER TABLE `article` DROP INDEX `Article_title_key`;
CREATE UNIQUE INDEX `Article_slug_locale_key` ON `article`(`slug`, `locale`);
CREATE UNIQUE INDEX `Article_title_locale_key` ON `article`(`title`, `locale`);

-- AlterTable: menuItem — no existing unique constraint to replace, just
-- adds the column plus an index for locale-filtered lookups.
ALTER TABLE `menuItem` ADD COLUMN `locale` VARCHAR(191) NOT NULL DEFAULT 'fr';
CREATE INDEX `menuItem_locale_idx` ON `menuItem`(`locale`);
