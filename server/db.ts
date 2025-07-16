import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// Only initialize database connection in production or when DATABASE_URL is available
let connection: any = null;
let db: any = null;

if (process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
  try {
    connection = mysql.createConnection(process.env.DATABASE_URL);
    db = drizzle(connection, { schema, mode: 'default' });
  } catch (error) {
    console.warn('Database connection failed, using memory storage');
  }
}

export { connection, db };