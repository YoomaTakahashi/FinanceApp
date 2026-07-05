const dashService = require('../services/dashboardService');

async function summary(req, res, next) {
  try {
    const data = await dashService.getSummary(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function monthlyChart(req, res, next) {
  try {
    const data = await dashService.getMonthlyChart(req.user.id, req.query.year);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function weeklyChart(req, res, next) {
  try {
    const data = await dashService.getWeeklyChart(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function topCategories(req, res, next) {
  try {
    const { type = 'expense', limit = 5 } = req.query;
    const data = await dashService.getTopCategories(req.user.id, type, parseInt(limit));
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function recentTransactions(req, res, next) {
  try {
    const { limit = 10 } = req.query;
    const data = await dashService.getRecentTransactions(req.user.id, parseInt(limit));
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

module.exports = { summary, monthlyChart, weeklyChart, topCategories, recentTransactions };
