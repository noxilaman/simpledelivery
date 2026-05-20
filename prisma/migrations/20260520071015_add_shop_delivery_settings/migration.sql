-- AlterTable
ALTER TABLE `Shop` ADD COLUMN `deliveryFee` DECIMAL(10, 2) NOT NULL DEFAULT 20.00,
    ADD COLUMN `deliveryNote` TEXT NULL;
