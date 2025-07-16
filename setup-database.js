#!/usr/bin/env node

import readline from 'readline';
import fs from 'fs';
import { exec } from 'child_process';
import { Pool } from 'pg';

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
  console.log('\n🚀 DLMETRIX Database Setup');
  console.log('==========================\n');

  try {
    // Collect database configuration
    const dbHost = await question('Host de la base de datos (ej: localhost): ');
    const dbPort = await question('Puerto de la base de datos (ej: 5432): ');
    const dbName = await question('Nombre de la base de datos (ej: dlmetrix): ');
    const dbUser = await question('Usuario de la base de datos: ');
    const dbPassword = await question('Contraseña de la base de datos: ');

    // Create DATABASE_URL
    const databaseUrl = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

    console.log('\n📝 Configurando variables de entorno...');

    // Create .env file
    const envContent = `# DLMETRIX Database Configuration
DATABASE_URL="${databaseUrl}"
PGHOST="${dbHost}"
PGPORT="${dbPort}"
PGDATABASE="${dbName}"
PGUSER="${dbUser}"
PGPASSWORD="${dbPassword}"
NODE_ENV="production"
`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ Archivo .env creado exitosamente');

    // Test database connection
    console.log('\n🔗 Probando conexión a la base de datos...');
    
    // Set environment variables for the test
    process.env.DATABASE_URL = databaseUrl;
    process.env.PGHOST = dbHost;
    process.env.PGPORT = dbPort;
    process.env.PGDATABASE = dbName;
    process.env.PGUSER = dbUser;
    process.env.PGPASSWORD = dbPassword;

    // Test connection using pg
    try {
      const pool = new Pool({
        connectionString: databaseUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      
      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      await pool.end();
      
      console.log('✅ Conexión a la base de datos exitosa');
      console.log(`📅 Timestamp del servidor: ${result.rows[0].now}`);
    } catch (error) {
      console.error('❌ Error de conexión a la base de datos:', error.message);
      console.log('\n💡 Verifica que:');
      console.log('   - La base de datos esté corriendo');
      console.log('   - Los credenciales sean correctos');
      console.log('   - El host y puerto sean accesibles');
      process.exit(1);
    }

    // Create database tables
    console.log('\n🏗️  Creando tablas de la base de datos...');
    
    return new Promise((resolve, reject) => {
      exec('npm run db:push', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Error creando tablas:', error.message);
          console.error('Salida del error:', stderr);
          reject(error);
          return;
        }
        
        console.log('✅ Tablas creadas exitosamente');
        console.log('📄 Salida de Drizzle:', stdout);
        resolve();
      });
    });

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
    console.log('   ✅ Conexión a base de datos verificada');
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