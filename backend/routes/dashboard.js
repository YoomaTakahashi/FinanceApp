const router = require('express').Router();
const ctrl   = require('../controllers/dashboardController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);
router.get('/summary',             ctrl.summary);
router.get('/chart/monthly',       ctrl.monthlyChart);
router.get('/chart/weekly',        ctrl.weeklyChart);
router.get('/top-categories',      ctrl.topCategories);
router.get('/recent-transactions', ctrl.recentTransactions);

module.exports = router;
