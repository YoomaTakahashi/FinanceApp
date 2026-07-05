const router = require('express').Router();
const ctrl   = require('../controllers/reportController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);
router.get('/weekly',  ctrl.weekly);
router.get('/monthly', ctrl.monthly);
router.get('/yearly',  ctrl.yearly);

module.exports = router;
