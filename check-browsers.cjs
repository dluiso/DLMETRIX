#!/usr/bin/env node

// Quick browser detection script for production server debugging (CommonJS version)
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 DLMETRIX Browser Detection Script');
console.log('=====================================\n');

// Common browser paths to check
const browserPaths = [
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome', 
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/opt/google/chrome/chrome',
  '/snap/bin/chromium',
  '/snap/bin/google-chrome-stable',
  '/usr/lib/chromium-browser/chromium-browser',
  '/usr/lib/chromium/chromium'
];

console.log('📁 Checking file system paths:');
let foundBrowsers = [];

for (const path of browserPaths) {
  if (fs.existsSync(path)) {
    console.log(`✅ FOUND: ${path}`);
    foundBrowsers.push(path);
  } else {
    console.log(`❌ NOT FOUND: ${path}`);
  }
}

console.log('\n🔍 Checking system commands:');
const commands = ['google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser'];

for (const cmd of commands) {
  try {
    const result = execSync(`which ${cmd}`, { encoding: 'utf8' }).trim();
    if (result) {
      console.log(`✅ COMMAND '${cmd}' -> ${result}`);
      if (!foundBrowsers.includes(result)) {
        foundBrowsers.push(result);
      }
    }
  } catch (e) {
    console.log(`❌ COMMAND '${cmd}' not found`);
  }
}

console.log('\n📋 SUMMARY:');
if (foundBrowsers.length > 0) {
  console.log(`✅ Found ${foundBrowsers.length} browser(s):`);
  foundBrowsers.forEach((browser, i) => {
    console.log(`   ${i + 1}. ${browser}`);
  });
  console.log('\n🎉 DLMETRIX Core Web Vitals should work!');
} else {
  console.log('❌ No browsers found. Core Web Vitals will not work.');
  console.log('\n📥 INSTALLATION COMMANDS:');
  console.log('# Install Google Chrome (recommended):');
  console.log('wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -');
  console.log('echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list');
  console.log('apt update && apt install -y google-chrome-stable');
  console.log('\n# OR install Chromium:');
  console.log('apt update && apt install -y chromium-browser');
}

console.log('\n🔄 After installation, restart DLMETRIX:');
console.log('pm2 restart dlmetrix');