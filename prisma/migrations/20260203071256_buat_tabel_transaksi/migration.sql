-- CreateTable
CREATE TABLE `Transaksi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `keterangan` VARCHAR(191) NOT NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `metode` VARCHAR(191) NOT NULL,
    `jumlahKotor` DOUBLE NOT NULL,
    `biayaAdmin` DOUBLE NOT NULL DEFAULT 0,
    `modal` DOUBLE NOT NULL DEFAULT 0,
    `jumlahBersih` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
