#!/bin/bash
# Build script for Vercel deployment

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🏗️ Building Next.js app..."
npm run build