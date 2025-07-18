#!/bin/bash

echo "🔧 DLMETRIX Git Conflict Resolution & Production Fix"
echo "===================================================="
echo "⚠️  EJECUTAR COMO USUARIO DE APP (dlplusmetrix)"
echo ""

cd ~/DLMETRIX

# Stop service first
echo "🛑 Stopping DLMETRIX..."
pm2 stop dlmetrix

# Resolve git conflict by stashing local changes
echo "🔄 Resolving git conflicts..."
git stash push -m "Local production fixes before update"
git pull origin main
echo "✅ Code updated from git"

# Clean previous build
echo "🧹 Cleaning previous installations..."
rm -rf node_modules package-lock.json dist

# Install dependencies
echo "📦 Installing all dependencies..."
npm install

# Build with corrected configuration
echo "🏗️ Building frontend..."
npx vite build

echo "🏗️ Building backend with proper externals..."
npx esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outdir=dist \
  --external:vite \
  --external:@vitejs/plugin-react \
  --external:@replit/vite-plugin-cartographer \
  --external:@replit/vite-plugin-runtime-error-modal

# Verify build
if [ -f "dist/index.js" ]; then
    echo "✅ Build successful"
    
    # Check for vite references (should be none)
    if grep -q "from \"vite\"" dist/index.js; then
        echo "⚠️  Warning: Build still contains vite imports"
    else
        echo "✅ No problematic vite references in build"
    fi
    
    echo "📁 Build contents:"
    ls -la dist/
else
    echo "❌ Build failed - dist/index.js not created"
    exit 1
fi

# Restart service
echo "🚀 Starting DLMETRIX with fixed build..."
pm2 restart dlmetrix

# Wait for startup
sleep 5

# Check logs
echo "📋 Checking startup logs..."
pm2 logs dlmetrix --lines 15 --nostream

echo ""
echo "🎉 Complete fix applied!"
echo "📋 Expected results:"
echo "  ✅ No 'Cannot find package vite' errors"
echo "  ✅ No MySQL acquireTimeout warnings"
echo "  ✅ Core Web Vitals working with Google Chrome"
echo ""
echo "🔍 Test at your domain to verify full functionality"