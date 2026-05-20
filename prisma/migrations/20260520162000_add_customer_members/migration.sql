ALTER TABLE `Order` ADD COLUMN `memberId` VARCHAR(191) NULL;

CREATE TABLE `CustomerMember` (
    `id` VARCHAR(191) NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `deliveryAddress` TEXT NOT NULL,
    `deliveryNote` TEXT NULL,
    `acceptedTermsAt` DATETIME(3) NOT NULL,
    `acceptedPdpaAt` DATETIME(3) NOT NULL,
    `totalOrders` INTEGER NOT NULL DEFAULT 0,
    `totalSpent` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `lastOrderedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CustomerMember_shopId_phone_key`(`shopId`, `phone`),
    INDEX `CustomerMember_shopId_updatedAt_idx`(`shopId`, `updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `Order_memberId_createdAt_idx` ON `Order`(`memberId`, `createdAt`);

ALTER TABLE `CustomerMember` ADD CONSTRAINT `CustomerMember_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Order` ADD CONSTRAINT `Order_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `CustomerMember`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
