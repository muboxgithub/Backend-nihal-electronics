/*
  Warnings:

  - A unique constraint covering the columns `[socialId]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `provider` VARCHAR(191) NULL,
    ADD COLUMN `socialId` VARCHAR(191) NULL,
    MODIFY `password_hash` VARCHAR(191) NULL,
    MODIFY `role` ENUM('admin', 'secretary', 'customer', 'delivery') NOT NULL DEFAULT 'customer';

-- CreateIndex
CREATE UNIQUE INDEX `Users_socialId_key` ON `Users`(`socialId`);
