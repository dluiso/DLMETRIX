#!/bin/bash

echo "🚀 DLMETRIX Quick Build Fix"
echo "==========================="
echo "⚠️  EJECUTAR COMO USUARIO DE APP (dlplusmetrix)"
echo ""

cd ~/DLMETRIX

# Stop service
echo "🛑 Stopping DLMETRIX..."
pm2 stop dlmetrix

# Clean previous installs
echo "🧹 Cleaning previous installations..."
rm -rf node_modules package-lock.json dist

# Install all dependencies with clean slate
echo "📦 Installing dependencies..."
npm install

# Build using npx to ensure local packages
echo "🏗️ Building frontend with Vite..."
npx vite build

echo "🏗️ Building backend with ESBuild..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Verify build
if [ -f "dist/index.js" ]; then
    echo "✅ Build successful"
    ls -la dist/
else
    echo "❌ Build failed"
    exit 1
fi

# Restart service
echo "🚀 Restarting DLMETRIX..."
pm2 restart dlmetrix

# Check logs
echo "📋 Checking logs..."
sleep 3
pm2 logs dlmetrix --lines 15 --nostream

echo ""
echo "🎉 Quick fix complete!"