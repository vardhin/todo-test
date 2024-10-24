const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client:', err.stack);
    return;
  }
  client.query('SELECT NOW()', (err, result) => {  
    release();
    if (err) {
      console.error('Error executing query:', err.stack);
      return;
    }
    console.log('Database connected successfully');
  });
});

module.exports = pool; 
