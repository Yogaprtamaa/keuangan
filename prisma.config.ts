// prisma.config.ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',  // sesuaikan kalau schema.prisma kamu di folder lain

  datasource: {
    url: env('DATABASE_URL'),  // pakai env() helper biar aman, atau langsung process.env.DATABASE_URL
    // kalau mau fallback lokal:
    // url: env('DATABASE_URL') ?? 'file:./dev.db',
  },

  // optional: kalau kamu punya custom migrations path atau lainnya
  migrations: {
    path: 'prisma/migrations',  // defaultnya ini, bisa dihapus kalau ga custom
  },
});