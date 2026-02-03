import { NextResponse } from 'next/server';
import { getTransaksiSummary } from '@/lib/prisma-service';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const period = (searchParams.get('period') || 'daily') as 'daily' | 'weekly' | 'monthly';

    const summary = await getTransaksiSummary(period);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("SUMMARY_ERROR:", error);
    return NextResponse.json({ error: "Gagal ambil ringkasan" }, { status: 500 });
  }
}