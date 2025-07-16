#!/usr/bin/env node

import mysql from 'mysql2/promise';

async function updateExistingDatabase() {
  try {
    console.log('🔍 Verificando base de datos existente...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'plusmitseometrix',
      password: 'PxwjcJDm9cgBG7ZHa8uQ',
      database: 'dbmpltrixseo'
    });

    console.log('✅ Conexión establecida');

    // Check existing tables
    const [existingTables] = await connection.execute("SHOW TABLES");
    const tableNames = existingTables.map(table => Object.values(table)[0]);
    
    console.log('📊 Tablas existentes:');
    tableNames.forEach(table => {
      console.log(`   - ${table}`);
    });

    // Check if shared_reports table exists
    if (!tableNames.includes('shared_reports')) {
      console.log('➕ Creando tabla shared_reports...');
      await connection.execute(`
        CREATE TABLE shared_reports (
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
      console.log('✅ Tabla shared_reports creada');
    } else {
      console.log('ℹ️ Tabla shared_reports ya existe');
    }

    // Check if web_analyses table exists, if not create it
    if (!tableNames.includes('web_analyses')) {
      console.log('➕ Creando tabla web_analyses...');
      await connection.execute(`
        CREATE TABLE web_analyses (
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
      console.log('✅ Tabla web_analyses creada');
    } else {
      console.log('ℹ️ Tabla web_analyses ya existe');
    }

    // Verify final tables
    const [finalTables] = await connection.execute("SHOW TABLES");
    console.log('📋 Estado final de las tablas:');
    finalTables.forEach(table => {
      console.log(`   ✓ ${Object.values(table)[0]}`);
    });

    // Create or update .env file
    console.log('📝 Verificando archivo .env...');
    
    const envContent = `NODE_ENV=production
DATABASE_URL=mysql://plusmitseometrix:PxwjcJDm9cgBG7ZHa8uQ@localhost:3306/dbmpltrixseo
`;

    const fs = await import('fs');
    await fs.promises.writeFile('.env', envContent);
    console.log('✅ Archivo .env actualizado');

    await connection.end();
    console.log('🎉 Actualización de base de datos completada');

    console.log('\n📋 Próximos pasos:');
    console.log('1. npm run build');
    console.log('2. pm2 restart dlmetrix');
    console.log('3. Probar el sistema de reportes compartibles');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Sugerencias:');
      console.log('- Verificar que MySQL esté corriendo');
      console.log('- Verificar las credenciales de la base de datos');
      console.log('- Confirmar que el puerto 3306 esté disponible');
    }
    
    process.exit(1);
  }
}

updateExistingDatabase();