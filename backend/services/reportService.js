const { pool } = require('../config/database');

async function getWeekly(userId, date) {
  const ref = date ? new Date(date) : new Date();
  const day = ref.getDay();
  const monday = new Date(ref);
  monday.setDate(ref.getDate() - (day === 0 ? 6 : day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const from = monday.toISOString().slice(0, 10);
  const to   = sunday.toISOString().slice(0, 10);

  return getSummaryBetween(userId, from, to, 'daily');
}

async function getMonthly(userId, year, month) {
  const y  = year  || new Date().getFullYear();
  const m  = month || new Date().getMonth() + 1;
  const from = `${y}-${String(m).padStart(2, '0')}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const to   = `${y}-${String(m).padStart(2, '0')}-${lastDay}`;

  return getSummaryBetween(userId, from, to, 'daily');
}

async function getYearly(userId, year) {
  const y    = year || new Date().getFullYear();
  const from = `${y}-01-01`;
  const to   = `${y}-12-31`;

  return getSummaryBetween(userId, from, to, 'monthly');
}

async function getSummaryBetween(userId, from, to, groupBy = 'daily') {
  const groupExpr = groupBy === 'monthly'
    ? "DATE_FORMAT(transaction_date,'%Y-%m')"
    : 'transaction_date';

  const [totals] = await pool.query(
    `SELECT
       SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS total_income,
       SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS total_expense,
       COUNT(*) AS transaction_count
     FROM transactions
     WHERE user_id = ? AND is_deleted = 0 AND status = 'completed'
       AND transaction_date BETWEEN ? AND ?`,
    [userId, from, to]
  );

  const [byPeriod] = await pool.query(
    `SELECT
       ${groupExpr} AS period,
       SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS income,
       SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense
     FROM transactions
     WHERE user_id = ? AND is_deleted = 0 AND status = 'completed'
       AND transaction_date BETWEEN ? AND ?
     GROUP BY period
     ORDER BY period`,
    [userId, from, to]
  );

  const [byCategory] = await pool.query(
    `SELECT
       c.id, c.name, c.icon, c.color, t.type,
       SUM(t.amount) AS total,
       COUNT(t.id) AS count
     FROM transactions t
     LEFT JOIN transaction_categories c ON t.category_id = c.id
     WHERE t.user_id = ? AND t.is_deleted = 0 AND t.status = 'completed'
       AND t.transaction_date BETWEEN ? AND ?
     GROUP BY t.category_id, t.type
     ORDER BY total DESC`,
    [userId, from, to]
  );

  const [transactions] = await pool.query(
    `SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
     FROM transactions t
     LEFT JOIN transaction_categories c ON t.category_id = c.id
     WHERE t.user_id = ? AND t.is_deleted = 0 AND t.status = 'completed'
       AND t.transaction_date BETWEEN ? AND ?
     ORDER BY t.transaction_date DESC`,
    [userId, from, to]
  );

  return {
    period: { from, to },
    summary: {
      total_income:      parseFloat(totals[0]?.total_income  || 0),
      total_expense:     parseFloat(totals[0]?.total_expense || 0),
      balance:           parseFloat(totals[0]?.total_income  || 0) - parseFloat(totals[0]?.total_expense || 0),
      transaction_count: totals[0]?.transaction_count || 0,
    },
    by_period:    byPeriod,
    by_category:  byCategory,
    transactions,
  };
}

module.exports = { getWeekly, getMonthly, getYearly };
