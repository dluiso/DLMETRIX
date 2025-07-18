#!/bin/bash

echo "🚀 DLMETRIX OffPage Analysis Production Fix"
echo "========================================="

# 1. Database Migration
echo "1. Adding off_page_data column to MySQL database..."
mysql -u root -p -e "
USE dlmetrix;
ALTER TABLE web_analyses ADD COLUMN IF NOT EXISTS off_page_data JSON NULL;
DESCRIBE web_analyses;
"

# 2. Git Pull Latest Changes
echo "2. Pulling latest changes from repository..."
git pull origin main

# 3. Install Dependencies
echo "3. Installing/updating dependencies..."
npm install

# 4. Build Production
echo "4. Building production version..."
npm run build

# 5. Restart PM2 Process
echo "5. Restarting PM2 process..."
pm2 restart dlmetrix

echo "✅ OffPage Analysis fix completed!"
echo "📊 OffPage Analysis now includes:"
echo "   - Domain Authority calculation (0-100)"
echo "   - Backlinks analysis with referring domains"
echo "   - Wikipedia verification across multiple languages"
echo "   - Trust metrics and social presence tracking"
echo "   - Professional UI with bilingual support"
echo ""
echo "🔧 Next steps for production:"
echo "1. Run this script on your server"
echo "2. Verify database column was added"
echo "3. Test analysis with any URL"
echo "4. Check that OffPage data displays correctly"