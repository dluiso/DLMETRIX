import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// Only initialize database connection in production or when DATABASE_URL is available
let connection: any = null;
let db: any = null;

async function initializeDatabase() {
  if (process.env.NODE_ENV === 'production') {
    try {
      console.log('🔄 Attempting database connection...');
      
      // Try with DATABASE_URL first
      if (process.env.DATABASE_URL) {
        console.log('📡 Using DATABASE_URL for connection');
        connection = await mysql.createConnection(process.env.DATABASE_URL);
      } else {
        // Fallback to individual parameters
        console.log('📡 Using individual MySQL parameters');
        connection = await mysql.createConnection({
          host: 'localhost',
          port: 3306,
          user: 'plusmitseometrix',
          password: 'PxwjcJDm9cgBG7ZHa8uQ',
          database: 'dbmpltrixseo',
          ssl: false
        });
      }
      
      // Test the connection
      await connection.execute('SELECT 1');
      console.log('✅ Database connection established successfully');
      
      db = drizzle(connection, { schema, mode: 'default' });
      console.log('✅ Drizzle ORM initialized');
      
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      console.warn('🔄 Will use memory storage as fallback');
      connection = null;
      db = null;
    }
  } else {
    console.log('🧪 Development mode: using memory storage');
  }
}

// Initialize database connection
initializeDatabase().catch(console.error);

export { connection, db };