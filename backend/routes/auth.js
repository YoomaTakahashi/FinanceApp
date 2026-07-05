const router = require('express').Router();
const ctrl   = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { authRateLimit } = require('../middlewares/rateLimiter');
const { validateAvatar } = require('../middlewares/upload');
const { body, validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
}

router.post('/register', authRateLimit, [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validate, ctrl.register);

router.post('/login', authRateLimit, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
], validate, ctrl.login);

router.post('/refresh', ctrl.refresh);
router.post('/logout', authenticate, ctrl.logout);
router.post('/logout-all', authenticate, ctrl.logoutAll);
router.get('/me', authenticate, ctrl.me);
router.put('/profile', authenticate, validateAvatar, [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
], validate, ctrl.updateProfile);
router.put('/change-password', authenticate, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], validate, ctrl.changePassword);

module.exports = router;
