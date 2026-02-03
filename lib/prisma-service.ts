// Isolated Prisma service - minimal dependencies for server bundle optimization
import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma client to avoid connection issues
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasourceUrl: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Initialize database on first connection
let dbInitialized = false;

async function initializeDb() {
  if (dbInitialized) return;
  
  try {
    // Try to connect to the database
    await prisma.$connect();
    console.log('Database connected successfully');
    dbInitialized = true;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Helper functions to keep API routes lightweight
export async function getAllTransaksi() {
  try {
    await initializeDb();
    return await prisma.transaksi.findMany({
      orderBy: { tanggal: 'desc' }
    });
  } catch (error) {
    console.error('getAllTransaksi error:', error);
    throw error;
  }
}

export async function createTransaksi(data: {
  keterangan: string;
  jumlah: number;
  tipe: string;
  metode?: string;
  biayaAdmin: number;
  totalBersih: number;
  tanggal?: Date;
}) {
  try {
    await initializeDb();
    console.log('Creating transaksi with data:', data);
    return await prisma.transaksi.create({ 
      data: {
        ...data,
        tanggal: data.tanggal || new Date()
      }
    });
  } catch (error) {
    console.error('createTransaksi error:', error);
    throw error;
  }
}

export async function deleteTransaksi(id: string) {
  return await prisma.transaksi.delete({ 
    where: { id } 
  });
}

export async function getTransaksiSummary(period: 'daily' | 'weekly' | 'monthly') {
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case 'daily':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'weekly':
      const dayOfWeek = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }
  
  const transaksi = await prisma.transaksi.findMany({
    where: {
      tanggal: {
        gte: startDate
      }
    }
  });

  const summary = transaksi.reduce(
    (acc, t) => {
      if (t.tipe === 'MASUK') {
        acc.totalMasuk += t.totalBersih;
      } else {
        acc.totalKeluar += t.totalBersih;
      }
      acc.totalBiayaAdmin += t.biayaAdmin;
      return acc;
    },
    { totalMasuk: 0, totalKeluar: 0, totalBiayaAdmin: 0 }
  );

  return {
    ...summary,
    selisih: summary.totalMasuk - summary.totalKeluar,
    jumlahTransaksi: transaksi.length,
    period
  };
}