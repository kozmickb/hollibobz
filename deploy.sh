#!/bin/bash
set -e

echo "🚀 Starting Railway deployment..."

# Find the server directory
if [ -d "server" ]; then
    echo "📁 Found server directory, navigating to it..."
    cd server
elif [ -f "prisma/schema.prisma" ]; then
    echo "📁 Already in server directory"
else
    echo "❌ Could not find server directory or prisma schema"
    echo "📋 Current directory contents:"
    ls -la
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo "📋 Directory contents:"
ls -la

# Check if Prisma schema exists
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Prisma schema not found at prisma/schema.prisma"
    echo "📋 Looking for schema files:"
    find . -name "*.prisma" -type f 2>/dev/null || echo "No .prisma files found"
    exit 1
fi

echo "✅ Found Prisma schema at prisma/schema.prisma"

echo "📦 Installing dependencies..."
npm ci

echo "🔧 Generating Prisma client..."
npx prisma generate --schema=./prisma/schema.prisma

echo "🏗️ Building TypeScript..."
npm run build

echo "✅ Build complete. Starting server..."
npm run start:railway
