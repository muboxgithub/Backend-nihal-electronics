-- AlterTable
ALTER TABLE `notifications` MODIFY `channel` ENUM('email', 'sms', 'both', 'push') NOT NULL DEFAULT 'email';

-- AlterTable
ALTER TABLE `products` ADD COLUMN `average_rating` DECIMAL(65, 30) NULL DEFAULT 0.0,
    ADD COLUMN `badge_type` ENUM('hot_deal', 'best_seller', 'new_arrival', 'featured') NULL,
    ADD COLUMN `discount_percentage` DECIMAL(65, 30) NULL,
    ADD COLUMN `is_featured` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `original_price` DECIMAL(65, 30) NULL,
    ADD COLUMN `review_count` INTEGER NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `BankPayments` (
    `bank_payment_id` VARCHAR(191) NOT NULL,
    `payment_id` VARCHAR(191) NOT NULL,
    `bank_name` VARCHAR(191) NOT NULL,
    `account_number` VARCHAR(191) NOT NULL,
    `receipt_url` VARCHAR(191) NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `verified_at` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,

    UNIQUE INDEX `BankPayments_payment_id_key`(`payment_id`),
    PRIMARY KEY (`bank_payment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationLogs` (
    `log_id` VARCHAR(191) NOT NULL,
    `notification_id` VARCHAR(191) NOT NULL,
    `sent_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `delivered` BOOLEAN NOT NULL DEFAULT false,
    `failed_reason` VARCHAR(191) NULL,

    PRIMARY KEY (`log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ratings` (
    `rating_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `review` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`rating_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Views` (
    `view_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `viewed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`view_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LovedProducts` (
    `loved_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`loved_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BankPayments` ADD CONSTRAINT `BankPayments_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `Payments`(`payment_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationLogs` ADD CONSTRAINT `NotificationLogs_notification_id_fkey` FOREIGN KEY (`notification_id`) REFERENCES `Notifications`(`notification_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ratings` ADD CONSTRAINT `Ratings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ratings` ADD CONSTRAINT `Ratings_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Products`(`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Views` ADD CONSTRAINT `Views_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Views` ADD CONSTRAINT `Views_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Products`(`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LovedProducts` ADD CONSTRAINT `LovedProducts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LovedProducts` ADD CONSTRAINT `LovedProducts_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Products`(`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;
