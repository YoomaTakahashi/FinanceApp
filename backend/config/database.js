const mysql = require('mysql2/promise');
require('dotenv').config();

// Railway/production provides a single connection URL (MYSQL_URL / DATABASE_URL);
// local development uses discrete DB_* variables.
const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

// Debug aid: show which DB-related env vars this process actually received
// (key names only — values are never logged). RAILWAY_* keys prove whether
// Railway injected anything at all into this container.
const envKeys     = Object.keys(process.env);
const dbKeys      = envKeys.filter((k) => /^(DB_|MYSQL|DATABASE_URL)/.test(k)).sort();
const railwayKeys = envKeys.filter((k) => k.startsWith('RAILWAY_')).sort();
console.log('🔎 DB-related env keys visible to this process:', dbKeys.length ? dbKeys : '(none)');
console.log('🔎 Railway-injected env keys:', railwayKeys.length ? railwayKeys : '(none — not running on Railway, or no vars applied)');

if (!connectionUrl && !process.env.DB_HOST) {
  throw new Error(
    'Database configuration missing: neither MYSQL_URL/DATABASE_URL nor DB_HOST is set.\n' +
    'Refusing to fall back to localhost/root defaults.\n' +
    '  - On Railway: open the BACKEND service (not the MySQL service) → Variables tab,\n' +
    '    add MYSQL_URL=${{MySQL.MYSQL_URL}} and press the "Deploy"/"Apply changes" button —\n' +
    '    staged variables are NOT applied until you deploy them.\n' +
    '  - Locally: create backend/.env from backend/.env.example.\n' +
    `  - Env keys this process can see: DB-related=[${dbKeys.join(', ') || 'none'}], RAILWAY=[${railwayKeys.join(', ') || 'none'}]`
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
