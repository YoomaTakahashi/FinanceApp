const { pool }   = require('../config/database');
const { paginate, buildPaginationMeta } = require('../utils/helpers');

async function getAll(userId, query = {}) {
  const { page = 1, limit = 20, is_read } = query;
  const { limit: lim, offset, page: pg } = paginate(page, limit);

  const conditions = ['user_id = ?'];
  const params     = [userId];

  if (is_read !== undefined && is_read !== '') {
    conditions.push('is_read = ?');
    params.push(parseInt(is_read));
  }

  const where = conditions.join(' AND ');

  const [[{ total }], [rows]] = await Promise.all([
    pool.query(`SELECT COUNT(*) AS total FROM notifications WHERE ${where}`, params),
    pool.query(`SELECT * FROM notifications WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, lim, offset]),
  ]);

  const [[{ unread }]] = await pool.query(
    'SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = 0',
    [userId]
  );

  return { data: rows, meta: buildPaginationMeta(total, pg, lim), unread_count: unread };
}

async function markRead(id, userId) {
  await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
}

async function markAllRead(userId) {
  await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
}

async function remove(id, userId) {
  const [rows] = await pool.query('SELECT id FROM notifications WHERE id = ? AND user_id = ?', [id, userId]);
  if (!rows.length) throw Object.assign(new Error('Notification not found'), { status: 404 });
  await pool.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [id, userId]);
}

async function create(userId, { title, message, type = 'system' }) {
  const [result] = await pool.query(
    'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
    [userId, title, message, type]
  );
  const [rows] = await pool.query('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
  return rows[0];
}

async function getUnreadCount(userId) {
  const [[{ count }]] = await pool.query(
    'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0',
    [userId]
  );
  return count;
}

module.exports = { getAll, markRead, markAllRead, remove, create, getUnreadCount };
