#!/usr/bin/env node

// Debug script para verificar configuración en producción
console.log('🔍 DLMETRIX Production Debug');
console.log('==========================');

console.log('\n📄 Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL value:', process.env.DATABASE_URL);
}

console.log('\n📁 Files:');
import fs from 'fs';

try {
  const envExists = fs.existsSync('.env');
  console.log('.env exists:', envExists);
  
  if (envExists) {
    const envContent = fs.readFileSync('.env', 'utf8');
    console.log('.env content:');
    console.log(envContent);
  }
} catch (error) {
  console.log('.env error:', error.message);
}

console.log('\n🧪 Testing MySQL connection:');
try {
  const mysql = await import('mysql2/promise');
  
  const config = {
    host: 'localhost',
    port: 3306,
    user: 'plusmitseometrix',
    password: 'PxwjcJDm9cgBG7ZHa8uQ',
    database: 'dbmpltrixseo',
    ssl: false
  };
  
  console.log('Attempting connection...');
  const connection = await mysql.default.createConnection(config);
  
  await connection.execute('SELECT 1');
  console.log('✅ MySQL connection successful');
  
  const [tables] = await connection.execute('SHOW TABLES');
  console.log('📊 Tables:', tables.map(t => Object.values(t)[0]));
  
  await connection.end();
  
} catch (error) {
  console.log('❌ MySQL connection failed:', error.message);
}

console.log('\n🎯 Recommendation:');
console.log('1. Ensure .env file exists with correct DATABASE_URL');
console.log('2. Restart PM2 after updating .env');
console.log('3. Check PM2 logs for connection messages');