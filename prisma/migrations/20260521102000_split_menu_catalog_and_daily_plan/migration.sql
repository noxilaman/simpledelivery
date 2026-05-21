ALTER TABLE `Menu` ADD COLUMN `isTemplate` BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX `Menu_shopId_isTemplate_idx` ON `Menu`(`shopId`, `isTemplate`);

INSERT INTO `Menu` (
  `id`,
  `shopId`,
  `isTemplate`,
  `name`,
  `description`,
  `price`,
  `imageUrl`,
  `availableDate`,
  `stockQty`,
  `soldQty`,
  `isAvailable`,
  `createdAt`,
  `updatedAt`
)
SELECT
  REPLACE(UUID(), '-', ''),
  source.`shopId`,
  true,
  source.`name`,
  source.`description`,
  source.`price`,
  source.`imageUrl`,
  DATE('1970-01-01'),
  0,
  0,
  true,
  CURRENT_TIMESTAMP(3),
  CURRENT_TIMESTAMP(3)
FROM (
  SELECT
    m.`shopId`,
    m.`name`,
    MIN(m.`description`) AS `description`,
    m.`price`,
    MIN(m.`imageUrl`) AS `imageUrl`
  FROM `Menu` m
  WHERE m.`isTemplate` = false
  GROUP BY m.`shopId`, m.`name`, m.`price`
) source;
