#!/bin/bash

echo "🚀 DLMETRIX Production Update Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: No package.json found. Make sure you're in the DLMETRIX directory."
    exit 1
fi

echo "📁 Current directory: $(pwd)"

# Update repository
echo ""
echo "📥 Updating repository..."
git pull origin main
if [ $? -ne 0 ]; then
    echo "❌ Git pull failed. Please resolve conflicts manually."
    exit 1
fi

echo "✅ Repository updated"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

echo "✅ Dependencies installed"

# Setup database
echo ""
echo "🗄️ Setting up database..."
node setup-cloudpanel.js
if [ $? -ne 0 ]; then
    echo "❌ Database setup failed"
    exit 1
fi

echo "✅ Database configured"

# Build application
echo ""
echo "🏗️ Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Application built"

# Restart PM2
echo ""
echo "🔄 Restarting application..."
pm2 restart dlmetrix
if [ $? -ne 0 ]; then
    echo "⚠️ PM2 restart failed, trying to start fresh..."
    pm2 delete dlmetrix 2>/dev/null
    pm2 start npm --name "dlmetrix" -- start
fi

echo "✅ Application restarted"

# Show status
echo ""
echo "📊 Application status:"
pm2 status dlmetrix

echo ""
echo "🎉 Update completed successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Test the application at your domain"
echo "  2. Try creating a shared report"
echo "  3. Verify the shared link works"
echo ""
echo "🔍 To check logs: pm2 logs dlmetrix"
echo "🛠️ To restart: pm2 restart dlmetrix"