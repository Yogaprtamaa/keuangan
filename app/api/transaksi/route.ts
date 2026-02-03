import { NextResponse } from 'next/server';
import { getAllTransaksi, createTransaksi, deleteTransaksi } from '@/lib/prisma-service';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const data = await getAllTransaksi();
    return NextResponse.json(data);
  } catch (error) {
    console.error("DB_FETCH_ERROR:", error);
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const jumlah = Number(body.jumlah || 0);
    const tipe = body.tipe || 'MASUK';
    
    // Hitung admin 35% kalau KELUAR dan online
    const biayaAdmin = tipe === 'KELUAR' && body.metode === 'online' ? jumlah * 0.35 : 0;
    const totalBersih = tipe === 'KELUAR' ? jumlah : jumlah - biayaAdmin;

    const newTransaksi = await createTransaksi({
      keterangan: body.keterangan,
      jumlah: jumlah,
      tipe: tipe,
      metode: body.metode || undefined,
      biayaAdmin: biayaAdmin,
      totalBersih: totalBersih,
      tanggal: body.tanggal ? new Date(body.tanggal) : new Date(),
    });
    return NextResponse.json(newTransaksi);
  } catch (error) {
    console.error("DB_SAVE_ERROR:", error);
    return NextResponse.json({ error: "Gagal Simpan" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    }

    const deletedTransaksi = await deleteTransaksi(id);

    return NextResponse.json(deletedTransaksi);
  } catch (error) {
    console.error("DB_DELETE_ERROR:", error);
    return NextResponse.json({ error: "Gagal hapus data" }, { status: 500 });
  }
}