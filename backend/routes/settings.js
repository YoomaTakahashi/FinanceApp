const router = require('express').Router();
const ctrl   = require('../controllers/settingsController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);
router.get('/',  ctrl.get);
router.put('/',  ctrl.update);

module.exports = router;
