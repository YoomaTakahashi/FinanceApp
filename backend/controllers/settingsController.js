const { pool } = require('../config/database');

async function get(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM settings WHERE user_id = ?', [req.user.id]);
    if (!rows.length) {
      await pool.query('INSERT INTO settings (user_id) VALUES (?)', [req.user.id]);
      const [fresh] = await pool.query('SELECT * FROM settings WHERE user_id = ?', [req.user.id]);
      return res.json({ success: true, data: fresh[0] });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const {
      theme, currency, currency_symbol, language, timezone,
      notify_daily, notify_weekly, notify_monthly,
      notify_bill, notify_expense, notify_income, monthly_budget,
    } = req.body;

    await pool.query(
      `UPDATE settings SET
         theme=?, currency=?, currency_symbol=?, language=?, timezone=?,
         notify_daily=?, notify_weekly=?, notify_monthly=?,
         notify_bill=?, notify_expense=?, notify_income=?, monthly_budget=?
       WHERE user_id = ?`,
      [theme, currency, currency_symbol, language, timezone,
       notify_daily ? 1 : 0, notify_weekly ? 1 : 0, notify_monthly ? 1 : 0,
       notify_bill ? 1 : 0, notify_expense ? 1 : 0, notify_income ? 1 : 0,
       monthly_budget || null, req.user.id]
    );

    const [rows] = await pool.query('SELECT * FROM settings WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'Settings updated', data: rows[0] });
  } catch (err) { next(err); }
}

module.exports = { get, update };
