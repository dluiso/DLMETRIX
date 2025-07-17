#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function addWaterfallColumn() {
  const config = {
    host: 'localhost',
    user: 'plusmitseometrix',
    password: 'PxwjcJDm9cgBG7ZHa8uQ',
    database: 'dbmpltrixseo'
  };

  try {
    console.log('🔧 DLMETRIX - Agregando columna waterfall_analysis automáticamente');
    console.log('================================================================');
    
    console.log('📡 Conectando a la base de datos...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Conexión exitosa a MySQL');
    
    // Verificar si la columna ya existe
    console.log('🔍 Verificando estructura actual de la tabla...');
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
    console.log('📋 Verificando estructura actualizada...');
    const [updatedColumns] = await connection.execute('DESCRIBE web_analyses');
    
    const waterfallCol = updatedColumns.find(col => col.Field === 'waterfall_analysis');
    if (waterfallCol) {
      console.log('🆕 waterfall_analysis - JSON (NULL) ✅');
    }
    
    await connection.end();
    console.log('🎉 Base de datos actualizada exitosamente');
    console.log('✅ DLMETRIX ahora puede almacenar análisis de Waterfall Analysis');
    
  } catch (error) {
    console.error('❌ Error al actualizar la base de datos:', error.message);
    process.exit(1);
  }
}

// Verificar que mysql2 esté disponible
try {
  require('mysql2');
  addWaterfallColumn();
} catch (error) {
  console.error('❌ Error: mysql2 no está instalado');
  console.error('💡 Instala mysql2 con: npm install mysql2');
  process.exit(1);
}