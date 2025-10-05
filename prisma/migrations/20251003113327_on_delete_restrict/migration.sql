-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `Products_category_id_fkey`;

-- DropIndex
DROP INDEX `Products_category_id_fkey` ON `products`;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Categories`(`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
