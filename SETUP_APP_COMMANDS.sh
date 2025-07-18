#!/bin/bash

echo "🔧 DLMETRIX App User Setup Commands"
echo "===================================="
echo "⚠️  EJECUTAR COMO USUARIO DE APP (dlplusmetrix)"
echo ""

# Stop DLMETRIX service
echo "🛑 Stopping DLMETRIX service..."
pm2 stop dlmetrix

# Update DLMETRIX code
echo "📥 Updating DLMETRIX code..."
cd ~/DLMETRIX

# Force update from git
echo "🔄 Force updating from git..."
git stash 2>/dev/null || true
git fetch origin main
git reset --hard origin/main
echo "✅ Code updated to latest version"

# Install ALL dependencies (including dev dependencies for build)
echo "📦 Installing all dependencies..."
npm install

# Build the application for production
echo "🏗️ Building application for production..."
npm run build

# Verify browser is accessible
echo "🧪 Verifying browser access..."
if [ -f "/usr/bin/google-chrome-stable" ]; then
    echo "✅ Google Chrome detected at: /usr/bin/google-chrome-stable"
elif [ -f "/usr/bin/google-chrome" ]; then
    echo "✅ Google Chrome detected at: /usr/bin/google-chrome"
elif [ -f "/usr/bin/chromium-browser" ]; then
    echo "✅ Chromium detected at: /usr/bin/chromium-browser"
else
    echo "❌ No browser found - root setup may have failed"
fi

# Verify build exists
if [ -f "dist/index.js" ]; then
    echo "✅ Production build completed successfully"
else
    echo "❌ Production build failed - dist/index.js not found"
    exit 1
fi

# Start DLMETRIX service
echo "🚀 Starting DLMETRIX service..."
pm2 restart dlmetrix

# Wait a moment for startup
sleep 5

# Show status
echo "📊 Service status:"
pm2 list | grep dlmetrix

# Show recent logs
echo "📋 Recent logs:"
pm2 logs dlmetrix --lines 10 --nostream

echo ""
echo "🎉 App setup complete!"
echo ""
echo "📋 VERIFICATION:"
echo "Check logs with: pm2 logs dlmetrix --lines 20"
echo "You should see: '✅ Found executable at: /usr/bin/google-chrome-stable'"
echo ""
echo "🔍 Test analysis at: https://your-domain.com"