#!/usr/bin/env node

// Force MySQL connection script for production
import mysql from 'mysql2/promise';
import fs from 'fs';

async function forceMySQLConnection() {
  console.log('🔧 FORCE MySQL Connection Setup');
  console.log('===============================');

  // Read current .env
  let envExists = false;
  let envContent = '';
  
  try {
    envContent = fs.readFileSync('.env', 'utf8');
    envExists = true;
    console.log('📄 Current .env file:');
    console.log(envContent);
  } catch (error) {
    console.log('📄 No .env file found, creating new one');
  }

  // Test multiple MySQL configurations
  const configs = [
    {
      name: 'CloudPanel Standard',
      config: {
        host: 'localhost',
        port: 3306,
        user: 'plusmitseometrix',
        password: 'PxwjcJDm9cgBG7ZHa8uQ',
        database: 'dbmpltrixseo',
        ssl: false,
        connectTimeout: 10000
      }
    },
    {
      name: '127.0.0.1 Alternative',
      config: {
        host: '127.0.0.1',
        port: 3306,
        user: 'plusmitseometrix',
        password: 'PxwjcJDm9cgBG7ZHa8uQ',
        database: 'dbmpltrixseo',
        ssl: false,
        connectTimeout: 10000
      }
    }
  ];

  let workingConfig = null;

  for (const test of configs) {
    try {
      console.log(`\n🧪 Testing: ${test.name}`);
      const connection = await mysql.createConnection(test.config);
      
      await connection.execute('SELECT 1');
      console.log('✅ Connection successful');
      
      const [tables] = await connection.execute('SHOW TABLES');
      console.log(`📊 Tables found: ${tables.length}`);
      
      // Test shared_reports table specifically
      try {
        const [reportCount] = await connection.execute('SELECT COUNT(*) as count FROM shared_reports');
        console.log(`📄 Shared reports in DB: ${reportCount[0].count}`);
      } catch (tableError) {
        console.log('⚠️ shared_reports table needs to be created');
      }
      
      await connection.end();
      workingConfig = test.config;
      console.log(`✅ ${test.name} - WORKING CONFIG FOUND`);
      break;
      
    } catch (error) {
      console.log(`❌ ${test.name} failed: ${error.message}`);
    }
  }

  if (!workingConfig) {
    console.log('\n❌ No working MySQL configuration found');
    console.log('🔍 Check:');
    console.log('  - MySQL server is running');
    console.log('  - User credentials are correct');
    console.log('  - Database dbmpltrixseo exists');
    return;
  }

  // Create optimized .env file
  console.log('\n📝 Creating optimized .env file...');
  const databaseUrl = `mysql://${workingConfig.user}:${workingConfig.password}@${workingConfig.host}:${workingConfig.port}/${workingConfig.database}`;
  
  const newEnvContent = `NODE_ENV=production
DATABASE_URL=${databaseUrl}
# MySQL connection verified: ${new Date().toISOString()}
`;

  fs.writeFileSync('.env', newEnvContent);
  console.log('✅ .env file updated');
  console.log('📄 New content:');
  console.log(newEnvContent);

  // Create/verify tables
  console.log('\n🗄️ Ensuring tables exist...');
  try {
    const connection = await mysql.createConnection(workingConfig);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS shared_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        share_token VARCHAR(191) NOT NULL UNIQUE,
        url TEXT NOT NULL,
        analysis_data LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        INDEX idx_share_token (share_token),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ Tables verified/created');
    await connection.end();
    
  } catch (error) {
    console.log('❌ Table creation failed:', error.message);
  }

  console.log('\n🎉 MySQL connection setup completed!');
  console.log('👉 Next steps:');
  console.log('  1. npm run build');
  console.log('  2. pm2 restart dlmetrix');
  console.log('  3. Check logs: pm2 logs dlmetrix --lines 10');
}

forceMySQLConnection().catch(console.error);