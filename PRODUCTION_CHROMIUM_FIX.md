# PRODUCTION CHROMIUM FIX - URGENT

## Issue Detected
The production server cannot find Chromium at `/usr/bin/chromium-browser`. This prevents Core Web Vitals, screenshots, and waterfall analysis from working.

## Solution Applied
Updated the server code to:

1. **Enhanced Browser Detection**: Added 10+ common browser paths including:
   - `/usr/bin/google-chrome-stable` (most common)
   - `/usr/bin/google-chrome`
   - `/usr/bin/chromium`
   - `/snap/bin/chromium` (snap installations)
   - `/opt/google/chrome/chrome` (manual installations)

2. **System Command Fallback**: Added automatic detection using `which` command:
   - `which google-chrome-stable`
   - `which chromium`
   - `which chromium-browser`

## Installation Commands for Production Server

If no browser is found, run these commands on your production server:

```bash
# Option 1: Install Google Chrome (recommended)
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
apt update
apt install -y google-chrome-stable

# Option 2: Install Chromium (lighter alternative)
apt update
apt install -y chromium-browser

# Option 3: Snap installation
snap install chromium
```

## Verification
After installation, the server will automatically detect the browser and enable:
- ✅ Core Web Vitals (mobile & desktop)
- ✅ Screenshots (mobile & desktop)  
- ✅ Waterfall Analysis
- ✅ Performance scores

The analysis will take 30-40 seconds instead of falling back to basic SEO analysis.

## Git Deployment
```bash
git add .
git commit -m "Fix: Enhanced Chromium detection for production server"
git push origin main
pm2 restart dlmetrix
```