const { pool } = require('../config/database');

async function getSummary(userId) {
  const now        = new Date();
  const thisMonth  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisYear   = String(now.getFullYear());

  // Current month totals
  const [monthly] = await pool.query(
    `SELECT
       SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS income,
       SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense
     FROM transactions
     WHERE user_id = ? AND is_deleted = 0 AND status = 'completed'
       AND DATE_FORMAT(transaction_date,'%Y-%m') = ?`,
    [userId, thisMonth]
  );

  // Yearly totals
  const [yearly] = await pool.query(
    `SELECT
       SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS income,
       SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense
     FROM transactions
     WHERE user_id = ? AND is_deleted = 0 AND status = 'completed'
       AND YEAR(transaction_date) = ?`,
    [userId, thisYear]
  );

  // All-time balance
  const [balance] = await pool.query(
    `SELECT
       SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) -
       SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS balance
     FROM transactions
     WHERE user_id = ? AND is_deleted = 0 AND status = 'completed'`,
    [userId]
  );

  return {
    balance:        parseFloat(balance[0]?.balance || 0),
    monthly_income:  parseFloat(monthly[0]?.income  || 0),
    monthly_expense: parseFloat(monthly[0]?.expense || 0),
    yearly_income:   parseFloat(yearly[0]?.income   || 0),
    yearly_expense:  parseFloat(yearly[0]?.expense  || 0),
  };
}

async function getMonthlyChart(userId, year) {
  const y = year || new Date().getFullYear();
  const [rows] = await pool.query(
    `SELECT
       MONTH(transaction_date) AS month,
       SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS income,
       SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense
     FROM transactions
     WHERE user_id = ? AND is_deleted = 0 AND status = 'completed' AND YEAR(transaction_date) = ?
     GROUP BY MONTH(transaction_date)
     ORDER BY month`,
    [userId, y]
  );

  const months = Array.from({ length: 12 }, (_, i) => {
    const found = rows.find(r => r.month === i + 1);
    return {
      month:   i + 1,
      income:  parseFloat(found?.income  || 0),
      expense: parseFloat(found?.expense || 0),
    };
  });

  return months;
}

async function getWeeklyChart(userId) {
  const [rows] = await pool.query(
    `SELECT
       DAYOFWEEK(transaction_date) AS day,
       SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS income,
       SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense
     FROM transactions
     WHERE user_id = ? AND is_deleted = 0 AND status = 'completed'
       AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
     GROUP BY DAYOFWEEK(transaction_date)`,
    [userId]
  );
  return rows;
}

async function getTopCategories(userId, type = 'expense', limit = 5) {
  const [rows] = await pool.query(
    `SELECT
       c.id, c.name, c.icon, c.color,
       SUM(t.amount) AS total,
       COUNT(t.id) AS count
     FROM transactions t
     LEFT JOIN transaction_categories c ON t.category_id = c.id
     WHERE t.user_id = ? AND t.type = ? AND t.is_deleted = 0 AND t.status = 'completed'
       AND DATE_FORMAT(t.transaction_date,'%Y-%m') = DATE_FORMAT(CURDATE(),'%Y-%m')
     GROUP BY t.category_id
     ORDER BY total DESC
     LIMIT ?`,
    [userId, type, limit]
  );
  return rows;
}

async function getRecentTransactions(userId, limit = 10) {
  const [rows] = await pool.query(
    `SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
     FROM transactions t
     LEFT JOIN transaction_categories c ON t.category_id = c.id
     WHERE t.user_id = ? AND t.is_deleted = 0
     ORDER BY t.transaction_date DESC, t.transaction_time DESC, t.created_at DESC
     LIMIT ?`,
    [userId, limit]
  );
  return rows;
}

module.exports = { getSummary, getMonthlyChart, getWeeklyChart, getTopCategories, getRecentTransactions };
