#!/usr/bin/env node

import readline from 'readline';
import fs from 'fs';
import { exec } from 'child_process';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function detectCloudPanelConfig() {
  console.log('🔍 Detectando configuración de CloudPanel...\n');
  
  // Buscar archivos de configuración comunes en CloudPanel
  const configPaths = [
    '/home/cloudpanel/htdocs/.env',
    process.env.HOME + '/.env',
    './wp-config.php',
    '../.env'
  ];
  
  for (const path of configPaths) {
    try {
      if (fs.existsSync(path)) {
        console.log(`📄 Encontrado archivo de config: ${path}`);
        const content = fs.readFileSync(path, 'utf8');
        
        // Buscar credenciales de DB
        const dbHost = content.match(/DB_HOST[=:]\s*['"]*([^'"\s]+)['"]*/) || content.match(/define\s*\(\s*['"]DB_HOST['"],\s*['"]([^'"]+)['"]/);
        const dbPort = content.match(/DB_PORT[=:]\s*['"]*([^'"\s]+)['"]*/) || ['', '3306'];
        const dbName = content.match(/DB_DATABASE[=:]\s*['"]*([^'"\s]+)['"]*/) || content.match(/DB_NAME[=:]\s*['"]*([^'"\s]+)['"]*/) || content.match(/define\s*\(\s*['"]DB_NAME['"],\s*['"]([^'"]+)['"]/);
        const dbUser = content.match(/DB_USERNAME[=:]\s*['"]*([^'"\s]+)['"]*/) || content.match(/DB_USER[=:]\s*['"]*([^'"\s]+)['"]*/) || content.match(/define\s*\(\s*['"]DB_USER['"],\s*['"]([^'"]+)['"]/);
        const dbPass = content.match(/DB_PASSWORD[=:]\s*['"]*([^'"\s]+)['"]*/) || content.match(/define\s*\(\s*['"]DB_PASSWORD['"],\s*['"]([^'"]+)['"]/);
        
        if (dbHost && dbName && dbUser) {
          console.log('✅ Credenciales detectadas automáticamente');
          return {
            host: dbHost[1] || 'localhost',
            port: dbPort[1] || '3306',
            database: dbName[1],
            user: dbUser[1],
            password: dbPass ? dbPass[1] : ''
          };
        }
      }
    } catch (error) {
      // Continuar buscando
    }
  }
  
  // Detectar CloudPanel database socket
  try {
    const socketPaths = [
      '/var/run/mysqld/mysqld.sock',
      '/tmp/mysql.sock',
      '/var/lib/mysql/mysql.sock'
    ];
    
    for (const socket of socketPaths) {
      if (fs.existsSync(socket)) {
        console.log(`🔌 Socket MySQL detectado: ${socket}`);
        return { useSocket: true, socketPath: socket };
      }
    }
  } catch (error) {
    // Continuar
  }
  
  return null;
}

async function setupDatabase() {
  console.log('\n🚀 DLMETRIX Database Setup (CloudPanel)');
  console.log('======================================\n');

  try {
    // Intentar detectar configuración automáticamente
    const detected = await detectCloudPanelConfig();
    
    let dbHost, dbPort, dbName, dbUser, dbPassword, useSocket = false, socketPath = '';
    
    if (detected) {
      if (detected.useSocket) {
        console.log('💡 Usando socket de MySQL local');
        useSocket = true;
        socketPath = detected.socketPath;
        dbHost = 'localhost';
        dbPort = '3306';
        dbName = await question('Nombre de la base de datos: ');
        dbUser = await question('Usuario de MySQL: ');
        dbPassword = await question('Contraseña de MySQL: ');
      } else {
        console.log('💡 Configuración detectada, confirma los datos:');
        dbHost = detected.host;
        dbPort = detected.port;
        dbName = detected.database;
        dbUser = detected.user;
        dbPassword = detected.password || await question('Contraseña de la base de datos: ');
        
        const confirm = await question(`¿Usar DB "${dbName}" con usuario "${dbUser}"? (s/n): `);
        if (confirm.toLowerCase() !== 's' && confirm.toLowerCase() !== 'y') {
          detected = null; // Pedir manualmente
        }
      }
    }
    
    if (!detected) {
      console.log('🔧 Configuración manual:');
      dbHost = await question('Host de la base de datos (localhost): ') || 'localhost';
      dbPort = await question('Puerto de la base de datos (3306): ') || '3306';
      dbName = await question('Nombre de la base de datos: ');
      dbUser = await question('Usuario de la base de datos: ');
      dbPassword = await question('Contraseña de la base de datos: ');
    }

    console.log('\n📝 Configurando variables de entorno...');

    // Create DATABASE_URL 
    const databaseUrl = useSocket 
      ? `mysql://${dbUser}:${dbPassword}@localhost/${dbName}?socketPath=${socketPath}`
      : `mysql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

    // Create .env file
    const envContent = `# DLMETRIX Database Configuration (CloudPanel)
DATABASE_URL="${databaseUrl}"
DB_HOST="${dbHost}"
DB_PORT="${dbPort}"
DB_NAME="${dbName}"
DB_USER="${dbUser}"
DB_PASSWORD="${dbPassword}"
${useSocket ? `DB_SOCKET="${socketPath}"` : ''}
NODE_ENV="production"
`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ Archivo .env creado exitosamente');

    // Test database connection
    console.log('\n🔗 Probando conexión a la base de datos...');
    
    try {
      const mysql = await import('mysql2/promise');
      
      const config = useSocket 
        ? { socketPath, user: dbUser, password: dbPassword, database: dbName }
        : { host: dbHost, port: parseInt(dbPort), user: dbUser, password: dbPassword, database: dbName };
      
      const connection = await mysql.createConnection(config);
      const [rows] = await connection.execute('SELECT NOW() as current_time, VERSION() as version');
      await connection.end();
      
      console.log('✅ Conexión a la base de datos exitosa');
      console.log(`📅 Timestamp: ${rows[0].current_time}`);
      console.log(`🗄️ MySQL Version: ${rows[0].version}`);
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND' || error.message.includes('mysql2')) {
        console.log('\n📦 Instalando mysql2...');
        await new Promise((resolve, reject) => {
          exec('npm install mysql2', (error, stdout, stderr) => {
            if (error) {
              console.error('❌ Error instalando mysql2:', error.message);
              reject(error);
              return;
            }
            console.log('✅ mysql2 instalado');
            resolve();
          });
        });
        
        // Reintentar conexión
        const mysql = await import('mysql2/promise');
        const config = useSocket 
          ? { socketPath, user: dbUser, password: dbPassword, database: dbName }
          : { host: dbHost, port: parseInt(dbPort), user: dbUser, password: dbPassword, database: dbName };
        
        const connection = await mysql.createConnection(config);
        await connection.execute('SELECT 1');
        await connection.end();
        console.log('✅ Conexión verificada después de instalar mysql2');
      } else {
        console.error('❌ Error de conexión:', error.message);
        console.log('\n💡 Posibles soluciones:');
        console.log('   - Verificar que MySQL esté corriendo');
        console.log('   - Verificar credenciales de acceso');
        console.log('   - Verificar que la base de datos exista');
        console.log('   - En CloudPanel, revisar el panel de MySQL');
        throw error;
      }
    }

    // Create database tables
    console.log('\n🏗️  Creando tablas...');
    
    const mysql = await import('mysql2/promise');
    const config = useSocket 
      ? { socketPath, user: dbUser, password: dbPassword, database: dbName }
      : { host: dbHost, port: parseInt(dbPort), user: dbUser, password: dbPassword, database: dbName };
    
    const connection = await mysql.createConnection(config);

    // Create web_analyses table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS web_analyses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        url VARCHAR(2048) NOT NULL,
        title VARCHAR(500),
        analysis_data JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_url (url(191)),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create shared_reports table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS shared_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        share_token VARCHAR(191) NOT NULL UNIQUE,
        url VARCHAR(2048) NOT NULL,
        analysis_data JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        INDEX idx_share_token (share_token),
        INDEX idx_expires_at (expires_at),
        INDEX idx_url (url(191))
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.end();
    
    console.log('✅ Tablas creadas exitosamente');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
    process.exit(1);
  }
}

async function main() {
  try {
    await setupDatabase();
    
    console.log('\n🎉 ¡Configuración completada!');
    console.log('\n📋 Resumen:');
    console.log('   ✅ Variables de entorno configuradas');
    console.log('   ✅ Conexión a MySQL verificada');
    console.log('   ✅ Tablas de DLMETRIX creadas');
    console.log('\n🚀 Para iniciar: npm run build && npm start');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

process.on('SIGINT', () => {
  console.log('\n\n⚠️  Cancelado');
  rl.close();
  process.exit(0);
});

main();