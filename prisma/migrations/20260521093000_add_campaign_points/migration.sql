-- CreateTable
CREATE TABLE `Campaign` (
    `id` VARCHAR(191) NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `conditionType` ENUM('NEW_CUSTOMER', 'MIN_PURCHASE', 'IN_PERIOD') NOT NULL,
    `minPurchaseAmount` DECIMAL(10, 2) NULL,
    `rewardType` ENUM('FIXED_POINTS', 'POINT_MULTIPLIER') NOT NULL,
    `rewardPoints` INTEGER NULL,
    `pointMultiplier` DECIMAL(6, 2) NULL,
    `startsAt` DATETIME(3) NOT NULL,
    `endsAt` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PointLedger` (
    `id` VARCHAR(191) NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NULL,
    `orderId` VARCHAR(191) NULL,
    `memberId` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerPhone` VARCHAR(191) NOT NULL,
    `points` INTEGER NOT NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Campaign_shopId_startsAt_endsAt_isActive_idx` ON `Campaign`(`shopId`, `startsAt`, `endsAt`, `isActive`);

-- CreateIndex
CREATE UNIQUE INDEX `PointLedger_campaignId_orderId_key` ON `PointLedger`(`campaignId`, `orderId`);

-- CreateIndex
CREATE INDEX `PointLedger_shopId_customerPhone_createdAt_idx` ON `PointLedger`(`shopId`, `customerPhone`, `createdAt`);

-- CreateIndex
CREATE INDEX `PointLedger_memberId_createdAt_idx` ON `PointLedger`(`memberId`, `createdAt`);

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PointLedger` ADD CONSTRAINT `PointLedger_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PointLedger` ADD CONSTRAINT `PointLedger_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PointLedger` ADD CONSTRAINT `PointLedger_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PointLedger` ADD CONSTRAINT `PointLedger_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `CustomerMember`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
