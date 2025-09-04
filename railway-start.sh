#!/bin/bash
set -e

echo "🚀 Railway startup script..."

# Ensure we're in the server directory
if [ -d "server" ]; then
    echo "📁 Navigating to server directory..."
    cd server
elif [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Not in server directory and no server/ subdirectory found"
    echo "📋 Current directory: $(pwd)"
    echo "📋 Directory contents:"
    ls -la
    exit 1
fi

echo "📁 Current directory: $(pwd)"

# Verify Prisma schema exists
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Prisma schema not found at prisma/schema.prisma"
    exit 1
fi

echo "✅ Prisma schema found, starting server..."
npm run start:railway
