#!/bin/bash

echo "🔧 DLMETRIX Root Setup Commands"
echo "==============================="
echo "⚠️  EJECUTAR COMO ROOT SOLAMENTE"
echo ""

# Remove existing Chromium installations
echo "🗑️ Removing existing Chromium installations..."
snap remove chromium 2>/dev/null || echo "No snap chromium to remove"
apt remove -y chromium-browser chromium 2>/dev/null || echo "No apt chromium to remove"

# Update system
echo "📦 Updating system packages..."
apt update

# Install Google Chrome (most reliable option)
echo "🌐 Installing Google Chrome..."
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
apt update
apt install -y google-chrome-stable

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
    apt install -y chromium-browser
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

echo ""
echo "🎉 Root setup complete!"
echo "Browser installed at: $BROWSER_PATH"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Exit root session"
echo "2. Login as app user (dlplusmetrix)"
echo "3. Run: ./SETUP_APP_COMMANDS.sh"