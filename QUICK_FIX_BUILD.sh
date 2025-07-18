#!/bin/bash

echo "🚀 DLMETRIX Quick Build Fix"
echo "==========================="
echo "⚠️  EJECUTAR COMO USUARIO DE APP (dlplusmetrix)"
echo ""

cd ~/DLMETRIX

# Stop service
echo "🛑 Stopping DLMETRIX..."
pm2 stop dlmetrix

# Install all dependencies
echo "📦 Installing dependencies..."
npm install

# Build for production
echo "🏗️ Building for production..."
npm run build

# Verify build
if [ -f "dist/index.js" ]; then
    echo "✅ Build successful"
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