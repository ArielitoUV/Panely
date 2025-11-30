/*
  Warnings:

  - You are about to drop the column `stockActual` on the `Insumo` table. All the data in the column will be lost.
  - You are about to drop the column `stockMinimo` on the `Insumo` table. All the data in the column will be lost.
  - Added the required column `cantidadCompra` to the `Insumo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costoPorUnidad` to the `Insumo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Insumo` DROP COLUMN `stockActual`,
    DROP COLUMN `stockMinimo`,
    ADD COLUMN `cantidadCompra` DOUBLE NOT NULL,
    ADD COLUMN `costoPorUnidad` DOUBLE NOT NULL;

-- CreateTable
CREATE TABLE `RecetaPan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RecetaItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recetaId` INTEGER NOT NULL,
    `insumoId` INTEGER NOT NULL,
    `cantidad` DOUBLE NOT NULL,
    `unidad` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `RecetaItem_recetaId_insumoId_key`(`recetaId`, `insumoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pedido` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cliente` VARCHAR(191) NOT NULL,
    `cantidadPanes` INTEGER NOT NULL,
    `recetaId` INTEGER NOT NULL,
    `costoTotal` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,

    INDEX `Pedido_userId_idx`(`userId`),
    INDEX `Pedido_recetaId_idx`(`recetaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RecetaPan` ADD CONSTRAINT `RecetaPan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecetaItem` ADD CONSTRAINT `RecetaItem_recetaId_fkey` FOREIGN KEY (`recetaId`) REFERENCES `RecetaPan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecetaItem` ADD CONSTRAINT `RecetaItem_insumoId_fkey` FOREIGN KEY (`insumoId`) REFERENCES `Insumo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_recetaId_fkey` FOREIGN KEY (`recetaId`) REFERENCES `RecetaPan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
