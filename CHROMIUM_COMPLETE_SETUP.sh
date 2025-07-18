#!/bin/bash

echo "🔧 DLMETRIX Chromium Complete Setup Script"
echo "==========================================="

# Stop DLMETRIX service
echo "🛑 Stopping DLMETRIX service..."
pm2 stop dlmetrix

# Remove existing Chromium installations
echo "🗑️ Removing existing Chromium installations..."
sudo snap remove chromium 2>/dev/null || echo "No snap chromium to remove"
sudo apt remove -y chromium-browser chromium 2>/dev/null || echo "No apt chromium to remove"

# Update system
echo "📦 Updating system packages..."
sudo apt update

# Install Google Chrome (most reliable option)
echo "🌐 Installing Google Chrome..."
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt update
sudo apt install -y google-chrome-stable

# Verify installation
echo "✅ Verifying browser installation..."
if [ -f "/usr/bin/google-chrome-stable" ]; then
    echo "✅ Google Chrome installed at: /usr/bin/google-chrome-stable"
    BROWSER_PATH="/usr/bin/google-chrome-stable"
elif [ -f "/usr/bin/google-chrome" ]; then
    echo "✅ Google Chrome installed at: /usr/bin/google-chrome"
    BROWSER_PATH="/usr/bin/google-chrome"
else
    echo "❌ Google Chrome installation failed, trying Chromium..."
    sudo apt install -y chromium-browser
    if [ -f "/usr/bin/chromium-browser" ]; then
        echo "✅ Chromium installed at: /usr/bin/chromium-browser"
        BROWSER_PATH="/usr/bin/chromium-browser"
    else
        echo "❌ Browser installation failed completely"
        exit 1
    fi
fi

# Test browser
echo "🧪 Testing browser functionality..."
$BROWSER_PATH --version && echo "✅ Browser responds correctly" || echo "⚠️ Browser test failed"

# Update DLMETRIX code
echo "📥 Updating DLMETRIX code..."
cd ~/DLMETRIX
git stash 2>/dev/null || true
git pull origin main
git stash pop 2>/dev/null || true

# Install/update dependencies if needed
echo "📦 Ensuring dependencies are up to date..."
npm install --production

# Start DLMETRIX service
echo "🚀 Starting DLMETRIX service..."
pm2 start dlmetrix

# Wait a moment for startup
sleep 3

# Show status
echo "📊 Service status:"
pm2 list | grep dlmetrix

echo ""
echo "🎉 Setup complete!"
echo "Browser installed at: $BROWSER_PATH"
echo "DLMETRIX should now have Core Web Vitals functionality"
echo ""
echo "To verify, check logs with: pm2 logs dlmetrix --lines 20"