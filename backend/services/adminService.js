const { pool } = require('../config/database');
const { paginate, buildPaginationMeta } = require('../utils/helpers');

async function listUsers(query = {}) {
  const { page = 1, limit = 20, search = '' } = query;
  const { limit: lim, offset, page: pg } = paginate(page, limit);

  const conditions = ['1=1'];
  const params     = [];

  if (search) {
    conditions.push('(name LIKE ? OR email LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.join(' AND ');

  const [[countRows], [rows]] = await Promise.all([
    pool.query(`SELECT COUNT(*) AS total FROM users WHERE ${where}`, params),
    pool.query(
      `SELECT id, name, email, role, avatar, is_active, created_at,
              (SELECT COUNT(*) FROM transactions t WHERE t.user_id = users.id AND t.is_deleted = 0) AS transaction_count
       FROM users WHERE ${where}
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, lim, offset]
    ),
  ]);

  return { data: rows, meta: buildPaginationMeta(countRows[0].total, pg, lim) };
}

async function updateUser(id, actingAdminId, { name, email, role, is_active }) {
  const [rows] = await pool.query('SELECT id, role FROM users WHERE id = ?', [id]);
  if (!rows.length) throw Object.assign(new Error('User not found'), { status: 404 });

  // An admin cannot demote or deactivate their own account —
  // prevents locking every admin out of the panel.
  if (id === actingAdminId) {
    if ((role && role !== 'admin') || is_active === 0 || is_active === false) {
      throw Object.assign(new Error('You cannot demote or deactivate your own account'), { status: 400 });
    }
  }

  if (email) {
    const [dup] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
    if (dup.length) throw Object.assign(new Error('Email already in use'), { status: 422 });
  }

  const fields = [];
  const params = [];
  if (name !== undefined)      { fields.push('name = ?');      params.push(name); }
  if (email !== undefined)     { fields.push('email = ?');     params.push(email); }
  if (role !== undefined)      { fields.push('role = ?');      params.push(role); }
  if (is_active !== undefined) { fields.push('is_active = ?'); params.push(is_active ? 1 : 0); }

  if (fields.length) {
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);
  }

  const [fresh] = await pool.query(
    'SELECT id, name, email, role, avatar, is_active, created_at FROM users WHERE id = ?',
    [id]
  );
  return fresh[0];
}

async function getStats() {
  const [[users], [active], [admins], [txs]] = await Promise.all([
    pool.query('SELECT COUNT(*) AS count FROM users'),
    pool.query('SELECT COUNT(*) AS count FROM users WHERE is_active = 1'),
    pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'"),
    pool.query('SELECT COUNT(*) AS count FROM transactions WHERE is_deleted = 0'),
  ]);
  return {
    total_users:        users[0].count,
    active_users:       active[0].count,
    admins:             admins[0].count,
    total_transactions: txs[0].count,
  };
}

module.exports = { listUsers, updateUser, getStats };
