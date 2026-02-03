/*
  Warnings:

  - You are about to drop the column `jumlahBersih` on the `transaksi` table. All the data in the column will be lost.
  - You are about to drop the column `jumlahKotor` on the `transaksi` table. All the data in the column will be lost.
  - You are about to drop the column `kategori` on the `transaksi` table. All the data in the column will be lost.
  - You are about to drop the column `modal` on the `transaksi` table. All the data in the column will be lost.
  - Added the required column `jumlah` to the `Transaksi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipe` to the `Transaksi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalBersih` to the `Transaksi` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `transaksi` DROP COLUMN `jumlahBersih`,
    DROP COLUMN `jumlahKotor`,
    DROP COLUMN `kategori`,
    DROP COLUMN `modal`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `jumlah` DOUBLE NOT NULL,
    ADD COLUMN `tipe` VARCHAR(191) NOT NULL,
    ADD COLUMN `totalBersih` DOUBLE NOT NULL,
    MODIFY `metode` VARCHAR(191) NULL;
