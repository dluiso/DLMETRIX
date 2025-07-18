#!/bin/bash

echo "🔧 DLMETRIX Production Build Fix"
echo "================================"
echo "⚠️  EJECUTAR COMO USUARIO DE APP (dlplusmetrix)"
echo ""

cd ~/DLMETRIX

# Stop service
echo "🛑 Stopping DLMETRIX..."
pm2 stop dlmetrix

# Remove dist to force clean build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Build frontend
echo "🏗️ Building frontend..."
npx vite build

# Build backend with proper externals
echo "🏗️ Building backend with corrected externals..."
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
    
    # Check if vite is still referenced in the build
    if grep -q "vite" dist/index.js; then
        echo "⚠️  Warning: Build still contains 'vite' references"
        echo "📋 First few vite references:"
        grep -n "vite" dist/index.js | head -3
    else
        echo "✅ No vite references in production build"
    fi
    
    ls -la dist/
else
    echo "❌ Build failed"
    exit 1
fi

# Restart service
echo "🚀 Restarting DLMETRIX..."
pm2 restart dlmetrix

# Wait and check logs
echo "📋 Checking startup logs..."
sleep 5
pm2 logs dlmetrix --lines 10 --nostream

echo ""
echo "🎉 Production build fix complete!"