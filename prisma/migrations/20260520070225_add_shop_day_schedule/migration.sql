-- CreateTable
CREATE TABLE `ShopDaySchedule` (
    `id` VARCHAR(191) NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `openTime` VARCHAR(191) NOT NULL DEFAULT '09:00',
    `closeTime` VARCHAR(191) NOT NULL DEFAULT '18:00',
    `isClosed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ShopDaySchedule_shopId_date_idx`(`shopId`, `date`),
    UNIQUE INDEX `ShopDaySchedule_shopId_date_key`(`shopId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ShopDaySchedule` ADD CONSTRAINT `ShopDaySchedule_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
