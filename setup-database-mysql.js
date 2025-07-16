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

async function setupDatabase() {
  console.log('\n🚀 DLMETRIX Database Setup (MySQL)');
  console.log('==================================\n');

  try {
    // Collect database configuration
    const dbHost = await question('Host de la base de datos (ej: localhost): ');
    const dbPort = await question('Puerto de la base de datos (ej: 3306): ');
    const dbName = await question('Nombre de la base de datos (ej: dlmetrix): ');
    const dbUser = await question('Usuario de la base de datos: ');
    const dbPassword = await question('Contraseña de la base de datos: ');

    // Create DATABASE_URL for MySQL
    const databaseUrl = `mysql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

    console.log('\n📝 Configurando variables de entorno...');

    // Create .env file
    const envContent = `# DLMETRIX Database Configuration (MySQL)
DATABASE_URL="${databaseUrl}"
DB_HOST="${dbHost}"
DB_PORT="${dbPort}"
DB_NAME="${dbName}"
DB_USER="${dbUser}"
DB_PASSWORD="${dbPassword}"
NODE_ENV="production"
`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ Archivo .env creado exitosamente');

    // Test database connection with MySQL
    console.log('\n🔗 Probando conexión a la base de datos...');
    
    try {
      // Dynamic import for mysql2
      const mysql = await import('mysql2/promise');
      
      const connection = await mysql.createConnection({
        host: dbHost,
        port: parseInt(dbPort),
        user: dbUser,
        password: dbPassword,
        database: dbName
      });
      
      const [rows] = await connection.execute('SELECT NOW() as current_time');
      await connection.end();
      
      console.log('✅ Conexión a la base de datos exitosa');
      console.log(`📅 Timestamp del servidor: ${rows[0].current_time}`);
    } catch (error) {
      console.error('❌ Error de conexión a la base de datos:', error.message);
      console.log('\n💡 Verifica que:');
      console.log('   - MySQL esté corriendo en el puerto 3306');
      console.log('   - Los credenciales sean correctos');
      console.log('   - La base de datos exista');
      console.log('   - El usuario tenga permisos de acceso');
      
      // Try to install mysql2 if it's missing
      if (error.code === 'MODULE_NOT_FOUND') {
        console.log('\n📦 Instalando mysql2...');
        return new Promise((resolve, reject) => {
          exec('npm install mysql2', (error, stdout, stderr) => {
            if (error) {
              console.error('❌ Error instalando mysql2:', error.message);
              reject(error);
              return;
            }
            console.log('✅ mysql2 instalado. Ejecuta el script nuevamente.');
            resolve();
          });
        });
      }
      
      process.exit(1);
    }

    // Create database tables for MySQL
    console.log('\n🏗️  Creando tablas de la base de datos...');
    
    try {
      const mysql = await import('mysql2/promise');
      
      const connection = await mysql.createConnection({
        host: dbHost,
        port: parseInt(dbPort),
        user: dbUser,
        password: dbPassword,
        database: dbName
      });

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
      console.log('   - web_analyses (para análisis principales)');
      console.log('   - shared_reports (para reportes compartibles)');

    } catch (error) {
      console.error('❌ Error creando tablas:', error.message);
      throw error;
    }

  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
    process.exit(1);
  }
}

async function main() {
  try {
    await setupDatabase();
    
    console.log('\n🎉 ¡Configuración completada exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('   ✅ Variables de entorno configuradas (.env)');
    console.log('   ✅ Conexión a MySQL verificada');
    console.log('   ✅ Tablas de DLMETRIX creadas');
    console.log('\n🚀 Tu aplicación DLMETRIX está lista para funcionar');
    console.log('\n💡 Para iniciar el servidor ejecuta: npm start');
    
  } catch (error) {
    console.error('\n❌ Error en la configuración:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Configuración cancelada por el usuario');
  rl.close();
  process.exit(0);
});

main();