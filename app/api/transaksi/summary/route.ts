import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'daily'; // daily, weekly, monthly

    const today = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        break;
      case 'weekly':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        startDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
        break;
      case 'monthly':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }

    const data = await prisma.transaksi.findMany({
      where: {
        tanggal: {
          gte: startDate,
          lt: new Date(startDate.getTime() + (period === 'daily' ? 1 : period === 'weekly' ? 7 : 31) * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { tanggal: 'desc' },
    });

    // Calculate summary
    interface SummaryData {
      totalPenjualan: number;
      totalPotongan: number;
      totalBersih: number;
      totalPengeluaran: number;
    }

    const summary = data.reduce(
      (acc: SummaryData, curr) => {
        if (curr.tipe === 'MASUK') {
          acc.totalPenjualan += curr.jumlah;
          acc.totalPotongan += curr.biayaAdmin;
          acc.totalBersih += curr.totalBersih;
        } else {
          acc.totalPengeluaran += curr.jumlah;
        }
        return acc;
      },
      {
        totalPenjualan: 0,
        totalPotongan: 0,
        totalBersih: 0,
        totalPengeluaran: 0,
      }
    );

    const pendapatanBersih = summary.totalBersih - summary.totalPengeluaran;

    return NextResponse.json({
      period,
      data,
      summary: {
        ...summary,
        pendapatanBersih,
      },
    });
  } catch (error) {
    console.error('SUMMARY_ERROR:', error);
    return NextResponse.json({ error: 'Gagal ambil summary' }, { status: 500 });
  }
}
