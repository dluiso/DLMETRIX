#!/bin/bash

echo "🚨 DLMETRIX Production Fix - IMMEDIATE"
echo "====================================="

# Ensure we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in DLMETRIX directory"
    exit 1
fi

echo "📁 Current directory: $(pwd)"

# Stop PM2 first
echo "🛑 Stopping PM2..."
pm2 stop dlmetrix

# Create .env file with correct settings
echo "📝 Creating .env file..."
cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=mysql://plusmitseometrix:PxwjcJDm9cgBG7ZHa8uQ@localhost:3306/dbmpltrixseo
EOF

echo "✅ .env created"

# Verify .env content
echo "📄 .env content:"
cat .env

# Make sure tables exist
echo "🗄️ Ensuring MySQL tables exist..."
mysql -u plusmitseometrix -pPxwjcJDm9cgBG7ZHa8uQ dbmpltrixseo << 'EOSQL'
CREATE TABLE IF NOT EXISTS shared_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  share_token VARCHAR(191) NOT NULL UNIQUE,
  url TEXT NOT NULL,
  analysis_data LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  INDEX idx_share_token (share_token),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS web_analyses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  keywords TEXT,
  canonical_url TEXT,
  robots_meta TEXT,
  viewport_meta TEXT,
  open_graph_tags JSON,
  twitter_card_tags JSON,
  schema_markup BOOLEAN DEFAULT FALSE,
  sitemap BOOLEAN DEFAULT FALSE,
  core_web_vitals JSON,
  performance_score INT DEFAULT 0,
  accessibility_score INT DEFAULT 0,
  best_practices_score INT DEFAULT 0,
  seo_score INT DEFAULT 0,
  mobile_screenshot MEDIUMTEXT,
  desktop_screenshot MEDIUMTEXT,
  recommendations JSON,
  diagnostics JSON,
  insights JSON,
  technical_checks JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
EOSQL

if [ $? -eq 0 ]; then
    echo "✅ MySQL tables verified"
else
    echo "❌ MySQL table creation failed"
    exit 1
fi

# Build application
echo "🏗️ Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed"

# Start PM2 with fresh environment
echo "🚀 Starting PM2..."
pm2 delete dlmetrix 2>/dev/null || true
pm2 start npm --name "dlmetrix" -- start

echo "✅ PM2 started"

# Show status
echo "📊 PM2 Status:"
pm2 status dlmetrix

echo ""
echo "🎉 Fix applied!"
echo "👀 Check logs: pm2 logs dlmetrix --lines 20"
echo "🔍 Debug: node debug-production.js"