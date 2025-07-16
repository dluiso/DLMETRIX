#!/usr/bin/env node

import mysql from 'mysql2/promise';

async function setupTables() {
  try {
    console.log('🗄️  Conectando a MySQL...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'plusmitseometrix',
      password: 'PxwjcJDm9cgBG7ZHa8uQ',
      database: 'dbmpltrixseo'
    });

    console.log('✅ Conexión establecida');

    // Create web_analyses table
    console.log('📋 Creando tabla web_analyses...');
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

    // Create shared_reports table
    console.log('📋 Creando tabla shared_reports...');
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

    console.log('✅ Tablas creadas exitosamente');

    // Verify tables exist
    const [tables] = await connection.execute("SHOW TABLES");
    console.log('📊 Tablas en la base de datos:');
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    await connection.end();
    console.log('🎉 Configuración de base de datos completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupTables();