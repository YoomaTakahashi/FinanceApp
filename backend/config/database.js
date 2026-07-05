const mysql = require('mysql2/promise');
require('dotenv').config();

// Railway/production provides a single connection URL (MYSQL_URL / DATABASE_URL);
// local development uses discrete DB_* variables.
const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

if (!connectionUrl && !process.env.DB_HOST) {
  console.warn(
    '⚠️  No MYSQL_URL/DATABASE_URL and no DB_HOST set — falling back to localhost/root defaults.\n' +
    '    This will fail in production. On Railway, set MYSQL_URL=${{MySQL.MYSQL_URL}}\n' +
    '    (or the DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME variables) on this service.'
  );
}

// Describe the connection target for startup logs WITHOUT leaking credentials:
// host/port/user/database only, password shown as set/not set.
function describeTarget() {
  if (connectionUrl) {
    try {
      const u = new URL(connectionUrl);
      return {
        source:      process.env.MYSQL_URL ? 'MYSQL_URL' : 'DATABASE_URL',
        host:        u.hostname,
        port:        u.port || '3306',
        user:        u.username,
        database:    u.pathname.replace(/^\//, ''),
        passwordSet: Boolean(u.password),
      };
    } catch {
      return {
        source: process.env.MYSQL_URL ? 'MYSQL_URL' : 'DATABASE_URL',
        note:   'value is not a parseable URL — check the variable format (mysql://user:pass@host:port/db)',
      };
    }
  }
  return {
    source:      'DB_* variables',
    host:        process.env.DB_HOST || 'localhost (default)',
    port:        process.env.DB_PORT || '3306 (default)',
    user:        process.env.DB_USER || 'root (default)',
    database:    process.env.DB_NAME || 'finance_db (default)',
    passwordSet: Boolean(process.env.DB_PASSWORD),
  };
}

console.log('🔌 MySQL pool target:', describeTarget());

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

// err.message can be empty (e.g. AggregateError when both IPv4 and IPv6
// connects are refused), so log the structured fields and any sub-errors too.
function describeDbError(err) {
  const detail = {
    message:  err.message || '(empty message)',
    code:     err.code,
    errno:    err.errno,
    sqlState: err.sqlState,
    fatal:    err.fatal,
  };
  if (err.address) detail.address = err.address;
  if (err.port)    detail.port    = err.port;
  if (Array.isArray(err.errors) && err.errors.length) {
    detail.errors = err.errors.map((e) => ({
      message: e.message, code: e.code, address: e.address, port: e.port,
    }));
  }
  return detail;
}

async function testConnection(retries = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await pool.getConnection();
      console.log('✅ Database connected successfully');
      conn.release();
      return;
    } catch (err) {
      console.error(
        `❌ Database connection failed (attempt ${attempt}/${retries}):`,
        JSON.stringify(describeDbError(err), null, 2)
      );
      if (attempt === retries) process.exit(1);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

module.exports = { pool, testConnection };
