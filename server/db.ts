import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// Database connection variables
let connection: any = null;
let db: any = null;
let isInitialized = false;

async function initializeDatabase() {
  if (isInitialized) return { connection, db };
  
  if (process.env.NODE_ENV === 'production') {
    try {
      console.log('🔄 Attempting database connection...');
      console.log('📋 Environment check:');
      console.log('  - NODE_ENV:', process.env.NODE_ENV);
      console.log('  - DATABASE_URL exists:', !!process.env.DATABASE_URL);
      
      // Parse DATABASE_URL or use individual config
      let config;
      if (process.env.DATABASE_URL) {
        console.log('📡 Using DATABASE_URL for connection');
        const url = new URL(process.env.DATABASE_URL);
        config = {
          host: url.hostname,
          port: parseInt(url.port) || 3306,
          user: url.username,
          password: url.password,
          database: url.pathname.slice(1), // Remove leading slash
          ssl: false,
          connectTimeout: 10000
        };
      } else {
        console.log('📡 Using individual MySQL parameters');
        config = {
          host: 'localhost',
          port: 3306,
          user: 'plusmitseometrix',
          password: 'PxwjcJDm9cgBG7ZHa8uQ',
          database: 'dbmpltrixseo',
          ssl: false,
          connectTimeout: 10000
        };
      }
      
      console.log('🔗 Connection config:', {
        host: config.host,
        port: config.port,
        user: config.user,
        database: config.database
      });
      
      connection = await mysql.createConnection(config);
      
      // Test the connection
      console.log('🧪 Testing connection...');
      await connection.execute('SELECT 1 as test');
      console.log('✅ Database connection established successfully');
      
      // Test database access
      const [tables] = await connection.execute('SHOW TABLES');
      console.log('📊 Available tables:', tables.length);
      
      db = drizzle(connection, { schema, mode: 'default' });
      console.log('✅ Drizzle ORM initialized');
      
      isInitialized = true;
      
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      console.error('🔍 Error details:', {
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState
      });
      console.warn('🔄 Will use memory storage as fallback');
      connection = null;
      db = null;
      isInitialized = true; // Prevent retry loops
    }
  } else {
    console.log('🧪 Development mode: using memory storage');
    isInitialized = true;
  }
  
  return { connection, db };
}

// Function to get database connection (async)
export async function getDatabase() {
  if (!isInitialized) {
    await initializeDatabase();
  }
  return { connection, db };
}

// Initialize database connection immediately
initializeDatabase().catch(console.error);

export { connection, db };