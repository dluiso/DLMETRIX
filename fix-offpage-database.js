const mysql = require('mysql2/promise');

async function addOffPageColumn() {
  let connection;
  
  try {
    // Connect to MySQL database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'dlmetrix'
    });

    console.log('🔗 Connected to MySQL database');

    // Check if column exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'web_analyses' 
      AND COLUMN_NAME = 'off_page_data'
    `);

    if (columns.length === 0) {
      console.log('➕ Adding off_page_data column...');
      
      // Add the column
      await connection.execute(`
        ALTER TABLE web_analyses 
        ADD COLUMN off_page_data JSON NULL
      `);
      
      console.log('✅ Column off_page_data added successfully');
    } else {
      console.log('✅ Column off_page_data already exists');
    }

    // Verify the column was added
    const [result] = await connection.execute(`DESCRIBE web_analyses`);
    const hasOffPageData = result.some(row => row.Field === 'off_page_data');
    
    if (hasOffPageData) {
      console.log('✅ Database schema updated successfully');
    } else {
      console.log('❌ Failed to add off_page_data column');
    }

  } catch (error) {
    console.error('❌ Database update error:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the migration
addOffPageColumn().catch(console.error);