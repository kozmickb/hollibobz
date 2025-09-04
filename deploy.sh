#!/bin/bash
set -e

echo "🚀 Starting Railway deployment..."

# Navigate to server directory
cd server

echo "📁 Current directory: $(pwd)"
echo "📋 Directory contents:"
ls -la

echo "📦 Installing dependencies..."
npm ci

echo "🔧 Generating Prisma client..."
npx prisma generate --schema=./prisma/schema.prisma

echo "🏗️ Building TypeScript..."
npm run build

echo "✅ Build complete. Starting server..."
npm run start:railway
