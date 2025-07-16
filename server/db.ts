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
      
      // Use DATABASE_URL (test confirmed it works)
      console.log('📡 Using DATABASE_URL for connection');
      connection = await mysql.createConnection(process.env.DATABASE_URL);
      
      // Test the connection
      await connection.execute('SELECT 1');
      console.log('✅ Database connection established successfully');
      
      db = drizzle(connection, { schema, mode: 'default' });
      console.log('✅ Drizzle ORM initialized');
      
      isInitialized = true;
      
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
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