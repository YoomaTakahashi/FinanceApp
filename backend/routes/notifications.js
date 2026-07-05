const router = require('express').Router();
const ctrl   = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);
router.get('/',               ctrl.list);
router.get('/unread-count',   ctrl.unreadCount);
router.put('/mark-all-read',  ctrl.markAllRead);
router.put('/:id/read',       ctrl.markRead);
router.delete('/:id',         ctrl.remove);

module.exports = router;
