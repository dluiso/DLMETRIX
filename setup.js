
#!/usr/bin/env node

import { createInterface } from 'readline';
import { writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupDatabase() {
  console.log('\n🚀 DLMETRIX SEO Tool - Configuración de Base de Datos\n');
  
  console.log('Selecciona el tipo de base de datos:');
  console.log('1. PostgreSQL (Recomendado para producción)');
  console.log('2. PostgreSQL de Replit (Base de datos integrada)');
  console.log('3. Configuración manual\n');
  
  const dbType = await question('Selecciona una opción (1-3): ');
  
  let databaseUrl = '';
  
  switch (dbType) {
    case '1':
      console.log('\n📊 Configuración PostgreSQL Externa\n');
      const host = await question('Host de la base de datos: ');
      const port = await question('Puerto (por defecto 5432): ') || '5432';
      const database = await question('Nombre de la base de datos: ');
      const username = await question('Usuario: ');
      const password = await question('Contraseña: ');
      
      databaseUrl = `postgresql://${username}:${password}@${host}:${port}/${database}`;
      break;
      
    case '2':
      console.log('\n🔧 Usando base de datos integrada de Replit...');
      
      // Verificar si ya existe DATABASE_URL en las variables de entorno
      try {
        const envUrl = process.env.DATABASE_URL;
        if (envUrl) {
          console.log('✅ DATABASE_URL ya está configurada en las variables de entorno');
          databaseUrl = envUrl;
        } else {
          console.log('⚠️  Necesitas configurar DATABASE_URL en Secrets de Replit');
          console.log('1. Ve a la pestaña "Secrets" en tu Repl');
          console.log('2. Agrega: DATABASE_URL como clave');
          console.log('3. El valor será proporcionado automáticamente por Replit');
          
          const continueSetup = await question('¿Continuar con la instalación? (y/N): ');
          if (continueSetup.toLowerCase() !== 'y') {
            console.log('Setup cancelado. Configura DATABASE_URL y ejecuta el script nuevamente.');
            process.exit(0);
          }
        }
      } catch (error) {
        console.log('ℹ️  DATABASE_URL se configurará automáticamente en deployment');
      }
      break;
      
    case '3':
      console.log('\n⚙️ Configuración Manual\n');
      databaseUrl = await question('Ingresa la URL completa de la base de datos: ');
      break;
      
    default:
      console.log('❌ Opción inválida');
      process.exit(1);
  }
  
  // Crear archivo .env local solo si se proporcionó una URL
  if (databaseUrl && !databaseUrl.includes('undefined')) {
    const envContent = `NODE_ENV=development
DATABASE_URL="${databaseUrl}"
`;
    
    try {
      writeFileSync('.env', envContent);
      console.log('✅ Archivo .env creado correctamente');
    } catch (error) {
      console.log('⚠️  No se pudo crear .env, asegúrate de configurar DATABASE_URL manualmente');
    }
  }
  
  console.log('\n📦 Instalando dependencias...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencias instaladas');
  } catch (error) {
    console.log('❌ Error instalando dependencias:', error.message);
    process.exit(1);
  }
  
  // Ejecutar migraciones de la base de datos
  if (databaseUrl || process.env.DATABASE_URL) {
    console.log('\n🗄️  Configurando esquema de base de datos...');
    try {
      execSync('npm run db:push', { stdio: 'inherit' });
      console.log('✅ Base de datos configurada correctamente');
    } catch (error) {
      console.log('⚠️  Error configurando la base de datos. Verifica la conexión.');
      console.log('   Puedes ejecutar "npm run db:push" manualmente más tarde.');
    }
  }
  
  console.log('\n🎉 ¡Configuración completada!\n');
  console.log('Para iniciar la aplicación:');
  console.log('  npm run dev     (desarrollo)');
  console.log('  npm run build   (construir para producción)');
  console.log('  npm start       (producción)\n');
  
  const startNow = await question('¿Iniciar la aplicación ahora? (y/N): ');
  if (startNow.toLowerCase() === 'y') {
    console.log('\n🚀 Iniciando aplicación...\n');
    execSync('npm run dev', { stdio: 'inherit' });
  }
}

async function main() {
  try {
    await setupDatabase();
  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Verificar si Node.js es la versión correcta
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('❌ Se requiere Node.js 18 o superior. Versión actual:', nodeVersion);
  process.exit(1);
}

console.log(`✅ Node.js ${nodeVersion} detectado`);
main();
