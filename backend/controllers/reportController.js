const reportService = require('../services/reportService');

async function weekly(req, res, next) {
  try {
    const data = await reportService.getWeekly(req.user.id, req.query.date);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function monthly(req, res, next) {
  try {
    const { year, month } = req.query;
    const data = await reportService.getMonthly(req.user.id, year, month);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function yearly(req, res, next) {
  try {
    const data = await reportService.getYearly(req.user.id, req.query.year);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

module.exports = { weekly, monthly, yearly };
