#!/usr/bin/env node

const mysql = require('mysql2/promise');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function addWaterfallColumn() {
  try {
    console.log('🔧 DLMETRIX - Actualizando Base de Datos con Columna Waterfall Analysis');
    console.log('======================================================================');
    
    // Configuración de base de datos
    const host = await question('Host de MySQL (localhost): ') || 'localhost';
    const user = await question('Usuario MySQL (plusmitseometrix): ') || 'plusmitseometrix';
    const password = await question('Contraseña MySQL: ');
    const database = await question('Nombre de la base de datos (dlmetrix): ') || 'dlmetrix';
    
    console.log('\n📡 Conectando a la base de datos...');
    
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      database
    });
    
    console.log('✅ Conexión exitosa a MySQL');
    
    // Verificar si la columna ya existe
    console.log('\n🔍 Verificando estructura actual de la tabla...');
    const [columns] = await connection.execute('DESCRIBE web_analyses');
    
    const hasWaterfallColumn = columns.some(col => col.Field === 'waterfall_analysis');
    
    if (hasWaterfallColumn) {
      console.log('✅ La columna waterfall_analysis ya existe. No se requiere actualización.');
    } else {
      console.log('🔧 Agregando columna waterfall_analysis...');
      
      await connection.execute(`
        ALTER TABLE web_analyses 
        ADD COLUMN waterfall_analysis JSON NULL 
        AFTER ai_search_analysis
      `);
      
      console.log('✅ Columna waterfall_analysis agregada exitosamente');
    }
    
    // Verificar la estructura actualizada
    console.log('\n📋 Estructura actualizada de la tabla web_analyses:');
    const [updatedColumns] = await connection.execute('DESCRIBE web_analyses');
    
    updatedColumns.forEach((col, index) => {
      const status = col.Field === 'waterfall_analysis' ? '🆕' : '📄';
      console.log(`  ${status} ${col.Field} - ${col.Type} (${col.Null})`);
    });
    
    await connection.end();
    console.log('\n🎉 Base de datos actualizada exitosamente');
    console.log('✅ DLMETRIX ahora puede almacenar análisis de Waterfall Analysis');
    
  } catch (error) {
    console.error('❌ Error al actualizar la base de datos:', error.message);
    console.error('💡 Verifica las credenciales y que la base de datos esté accesible');
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Verificar que mysql2 esté disponible
try {
  require('mysql2');
} catch (error) {
  console.error('❌ Error: mysql2 no está instalado');
  console.error('💡 Instala mysql2 con: npm install mysql2');
  process.exit(1);
}

if (require.main === module) {
  addWaterfallColumn();
}

module.exports = { addWaterfallColumn };