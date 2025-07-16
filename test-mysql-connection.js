#!/usr/bin/env node

import mysql from 'mysql2/promise';

async function testConnection() {
  console.log('🔍 Testing MySQL connection for DLMETRIX...');
  console.log('=======================================');

  const configs = [
    {
      name: 'DATABASE_URL',
      config: 'mysql://plusmitseometrix:PxwjcJDm9cgBG7ZHa8uQ@localhost:3306/dbmpltrixseo'
    },
    {
      name: 'Individual Parameters',
      config: {
        host: 'localhost',
        port: 3306,
        user: 'plusmitseometrix',
        password: 'PxwjcJDm9cgBG7ZHa8uQ',
        database: 'dbmpltrixseo',
        ssl: false
      }
    },
    {
      name: '127.0.0.1 instead of localhost',
      config: {
        host: '127.0.0.1',
        port: 3306,
        user: 'plusmitseometrix',
        password: 'PxwjcJDm9cgBG7ZHa8uQ',
        database: 'dbmpltrixseo',
        ssl: false
      }
    }
  ];

  for (const test of configs) {
    try {
      console.log(`\n🧪 Testing: ${test.name}`);
      console.log('Configuration:', typeof test.config === 'string' ? test.config : JSON.stringify(test.config, null, 2));
      
      const connection = await mysql.createConnection(test.config);
      
      // Test query
      const [result] = await connection.execute('SELECT 1 as test');
      console.log('✅ Connection successful');
      console.log('Query result:', result);
      
      // Test database access
      const [tables] = await connection.execute('SHOW TABLES');
      console.log('📊 Tables found:', tables.length);
      tables.forEach(table => {
        console.log(`   - ${Object.values(table)[0]}`);
      });
      
      await connection.end();
      console.log(`✅ ${test.name} - SUCCESS`);
      
    } catch (error) {
      console.log(`❌ ${test.name} - FAILED`);
      console.log('Error:', error.message);
      console.log('Code:', error.code);
    }
  }

  console.log('\n🏁 Test completed');
}

testConnection().catch(console.error);