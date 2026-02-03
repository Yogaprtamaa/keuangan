#!/bin/bash

# Vercel Build Script for Prisma
echo "🔧 Starting Prisma setup for Vercel deployment..."

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
pnpm prisma generate

# Create database if not exists (for SQLite)
echo "🗄️ Setting up database..."
if [ ! -f "./dev.db" ]; then
    echo "📋 Creating SQLite database..."
    touch dev.db
fi

# Apply database migrations/schema
echo "🔄 Applying database schema..."
pnpm prisma db push --skip-generate

echo "✅ Prisma setup complete!"