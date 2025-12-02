-- AlterTable
ALTER TABLE `Insumo` ADD COLUMN `costoPorGramo` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `stockGramos` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `costoPorUnidad` DOUBLE NULL;

-- CreateTable
CREATE TABLE `Receta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `cantidadBase` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Receta_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IngredienteReceta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recetaId` INTEGER NOT NULL,
    `insumoId` INTEGER NOT NULL,
    `cantidadGramos` DOUBLE NOT NULL,

    INDEX `IngredienteReceta_recetaId_idx`(`recetaId`),
    INDEX `IngredienteReceta_insumoId_idx`(`insumoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pedido` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombreCliente` VARCHAR(191) NOT NULL,
    `cantidadPanes` INTEGER NOT NULL,
    `montoTotal` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `recetaId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `resumen` TEXT NULL,

    INDEX `Pedido_userId_idx`(`userId`),
    INDEX `Pedido_recetaId_idx`(`recetaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Receta` ADD CONSTRAINT `Receta_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngredienteReceta` ADD CONSTRAINT `IngredienteReceta_recetaId_fkey` FOREIGN KEY (`recetaId`) REFERENCES `Receta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngredienteReceta` ADD CONSTRAINT `IngredienteReceta_insumoId_fkey` FOREIGN KEY (`insumoId`) REFERENCES `Insumo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_recetaId_fkey` FOREIGN KEY (`recetaId`) REFERENCES `Receta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
