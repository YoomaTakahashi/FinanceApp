const { pool }   = require('../config/database');
const { paginate, buildPaginationMeta } = require('../utils/helpers');
const path = require('path');
const fs   = require('fs');

async function getAll(userId, query = {}) {
  const { page = 1, limit = 20, type, category_id, status, search,
          date_from, date_to, payment_method, sort = 'transaction_date', order = 'DESC' } = query;

  const { limit: lim, offset, page: pg } = paginate(page, limit);

  const allowed = ['transaction_date', 'amount', 'created_at', 'title'];
  const sortCol = allowed.includes(sort) ? sort : 'transaction_date';
  const sortDir = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const conditions = ['t.user_id = ?', 't.is_deleted = 0'];
  const params     = [userId];

  if (type)           { conditions.push('t.type = ?');            params.push(type); }
  if (category_id)    { conditions.push('t.category_id = ?');     params.push(category_id); }
  if (status)         { conditions.push('t.status = ?');          params.push(status); }
  if (payment_method) { conditions.push('t.payment_method = ?');  params.push(payment_method); }
  if (date_from)      { conditions.push('t.transaction_date >= ?'); params.push(date_from); }
  if (date_to)        { conditions.push('t.transaction_date <= ?'); params.push(date_to); }
  if (search) {
    conditions.push('(t.title LIKE ? OR t.description LIKE ? OR t.note LIKE ?)');
    const like = `%${search}%`;
    params.push(like, like, like);
  }

  const where = conditions.join(' AND ');

  const countSql = `SELECT COUNT(*) AS total FROM transactions t WHERE ${where}`;
  const dataSql  = `
    SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color,
           s.file_path AS slip_path, s.filename AS slip_filename
    FROM transactions t
    LEFT JOIN transaction_categories c ON t.category_id = c.id
    LEFT JOIN uploaded_slips s ON s.transaction_id = t.id
    WHERE ${where}
    ORDER BY t.${sortCol} ${sortDir}
    LIMIT ? OFFSET ?
  `;

  const [[countRows], [rows]] = await Promise.all([
    pool.query(countSql, params),
    pool.query(dataSql, [...params, lim, offset]),
  ]);
  const total = countRows[0].total;

  return { data: rows, meta: buildPaginationMeta(total, pg, lim) };
}

async function getById(id, userId) {
  const [rows] = await pool.query(
    `SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color,
            s.file_path AS slip_path, s.filename AS slip_filename, s.id AS slip_id
     FROM transactions t
     LEFT JOIN transaction_categories c ON t.category_id = c.id
     LEFT JOIN uploaded_slips s ON s.transaction_id = t.id
     WHERE t.id = ? AND t.user_id = ? AND t.is_deleted = 0`,
    [id, userId]
  );
  return rows[0] || null;
}

async function create(userId, data) {
  const { title, description, amount, type, category_id, transaction_date,
          transaction_time, payment_method, note, status } = data;

  const [result] = await pool.query(
    `INSERT INTO transactions
     (user_id, category_id, title, description, amount, type, transaction_date, transaction_time, payment_method, note, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, category_id || null, title, description || null, parseFloat(amount), type,
     transaction_date, transaction_time || '00:00:00', payment_method || 'cash', note || null, status || 'completed']
  );

  return getById(result.insertId, userId);
}

async function update(id, userId, data) {
  const existing = await getById(id, userId);
  if (!existing) throw Object.assign(new Error('Transaction not found'), { status: 404 });

  const { title, description, amount, type, category_id, transaction_date,
          transaction_time, payment_method, note, status } = data;

  await pool.query(
    `UPDATE transactions
     SET title=?, description=?, amount=?, type=?, category_id=?,
         transaction_date=?, transaction_time=?, payment_method=?, note=?, status=?
     WHERE id = ? AND user_id = ?`,
    [title, description || null, parseFloat(amount), type, category_id || null,
     transaction_date, transaction_time || '00:00:00', payment_method || 'cash',
     note || null, status || 'completed', id, userId]
  );

  return getById(id, userId);
}

async function softDelete(id, userId) {
  const existing = await getById(id, userId);
  if (!existing) throw Object.assign(new Error('Transaction not found'), { status: 404 });

  await pool.query(
    'UPDATE transactions SET is_deleted = 1, deleted_at = NOW() WHERE id = ? AND user_id = ?',
    [id, userId]
  );
}

async function restore(id, userId) {
  await pool.query(
    'UPDATE transactions SET is_deleted = 0, deleted_at = NULL WHERE id = ? AND user_id = ?',
    [id, userId]
  );
}

async function duplicate(id, userId) {
  const existing = await getById(id, userId);
  if (!existing) throw Object.assign(new Error('Transaction not found'), { status: 404 });

  const { title, description, amount, type, category_id, transaction_date,
          transaction_time, payment_method, note, status } = existing;

  return create(userId, {
    title: `${title} (copy)`, description, amount, type, category_id,
    transaction_date, transaction_time, payment_method, note, status,
  });
}

async function attachSlip(transactionId, userId, file, uploadsDir) {
  // Remove old slip if exists
  const [old] = await pool.query(
    'SELECT * FROM uploaded_slips WHERE transaction_id = ?',
    [transactionId]
  );
  if (old.length) {
    const oldPath = path.join(uploadsDir, old[0].filename);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    await pool.query('DELETE FROM uploaded_slips WHERE transaction_id = ?', [transactionId]);
  }

  const ext      = path.extname(file.name);
  const filename = `slip_${transactionId}_${Date.now()}${ext}`;
  const dest     = path.join(uploadsDir, filename);

  await file.mv(dest);

  await pool.query(
    'INSERT INTO uploaded_slips (transaction_id, user_id, filename, original_name, mime_type, file_size, file_path) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [transactionId, userId, filename, file.name, file.mimetype, file.size, `/uploads/slips/${filename}`]
  );

  return `/uploads/slips/${filename}`;
}

async function removeSlip(transactionId, userId, uploadsDir) {
  const [rows] = await pool.query(
    'SELECT * FROM uploaded_slips WHERE transaction_id = ? AND user_id = ?',
    [transactionId, userId]
  );
  if (!rows.length) throw Object.assign(new Error('Slip not found'), { status: 404 });

  const filePath = path.join(uploadsDir, rows[0].filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await pool.query('DELETE FROM uploaded_slips WHERE transaction_id = ? AND user_id = ?', [transactionId, userId]);
}

module.exports = { getAll, getById, create, update, softDelete, restore, duplicate, attachSlip, removeSlip };
