const mysql = require('mysql2/promise');
require('dotenv').config();

// Railway/production provides a single connection URL (MYSQL_URL / DATABASE_URL);
// local development uses discrete DB_* variables.
const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

const poolOptions = {
  waitForConnections: true,
  connectionLimit:    20,
  queueLimit:         0,
  timezone:           '+00:00',
  charset:            'utf8mb4',
};

const pool = connectionUrl
  ? mysql.createPool({ uri: connectionUrl, ...poolOptions })
  : mysql.createPool({
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT) || 3306,
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME     || 'finance_db',
      ...poolOptions,
    });

async function testConnection(retries = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await pool.getConnection();
      console.log('✅ Database connected successfully');
      conn.release();
      return;
    } catch (err) {
      console.error(`❌ Database connection failed (attempt ${attempt}/${retries}):`, err.message);
      if (attempt === retries) process.exit(1);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

module.exports = { pool, testConnection };
