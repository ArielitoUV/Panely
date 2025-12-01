/*
  Warnings:

  - You are about to drop the `Pedido` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RecetaItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RecetaPan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Pedido` DROP FOREIGN KEY `Pedido_recetaId_fkey`;

-- DropForeignKey
ALTER TABLE `Pedido` DROP FOREIGN KEY `Pedido_userId_fkey`;

-- DropForeignKey
ALTER TABLE `RecetaItem` DROP FOREIGN KEY `RecetaItem_insumoId_fkey`;

-- DropForeignKey
ALTER TABLE `RecetaItem` DROP FOREIGN KEY `RecetaItem_recetaId_fkey`;

-- DropForeignKey
ALTER TABLE `RecetaPan` DROP FOREIGN KEY `RecetaPan_userId_fkey`;

-- DropTable
DROP TABLE `Pedido`;

-- DropTable
DROP TABLE `RecetaItem`;

-- DropTable
DROP TABLE `RecetaPan`;
