const { pool } = require('../config/database');

async function getAll(userId) {
  const [rows] = await pool.query(
    `SELECT * FROM transaction_categories
     WHERE user_id = ? OR is_default = 1
     ORDER BY is_default DESC, name ASC`,
    [userId]
  );
  return rows;
}

async function getById(id, userId) {
  const [rows] = await pool.query(
    'SELECT * FROM transaction_categories WHERE id = ? AND (user_id = ? OR is_default = 1)',
    [id, userId]
  );
  return rows[0] || null;
}

async function create(userId, { name, type, icon, color }) {
  const [result] = await pool.query(
    'INSERT INTO transaction_categories (user_id, name, type, icon, color) VALUES (?, ?, ?, ?, ?)',
    [userId, name, type || 'both', icon || 'mdi-tag', color || '#C9A84C']
  );
  return getById(result.insertId, userId);
}

async function update(id, userId, { name, type, icon, color }) {
  const [existing] = await pool.query(
    'SELECT * FROM transaction_categories WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  if (!existing.length) throw Object.assign(new Error('Category not found'), { status: 404 });

  await pool.query(
    'UPDATE transaction_categories SET name = ?, type = ?, icon = ?, color = ? WHERE id = ? AND user_id = ?',
    [name, type, icon, color, id, userId]
  );
  return getById(id, userId);
}

async function remove(id, userId) {
  const [existing] = await pool.query(
    'SELECT * FROM transaction_categories WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  if (!existing.length) throw Object.assign(new Error('Category not found or cannot delete default'), { status: 404 });

  // Unlink transactions
  await pool.query('UPDATE transactions SET category_id = NULL WHERE category_id = ? AND user_id = ?', [id, userId]);
  await pool.query('DELETE FROM transaction_categories WHERE id = ? AND user_id = ?', [id, userId]);
}

module.exports = { getAll, getById, create, update, remove };
