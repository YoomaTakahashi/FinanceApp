const { pool } = require('../config/database');

async function logActivity(userId, action, description = null, req = null) {
  try {
    const ip        = req ? (req.ip || req.connection?.remoteAddress || null) : null;
    const userAgent = req ? (req.headers['user-agent'] || null) : null;
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
      [userId, action, description, ip, userAgent]
    );
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
}

module.exports = { logActivity };
