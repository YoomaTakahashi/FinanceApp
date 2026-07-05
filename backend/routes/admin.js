const router = require('express').Router();
const ctrl   = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const { body, validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
}

const userValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 100 }),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
];

// Every admin route re-checks the role from the DB on each request
// (authenticate loads the user fresh; requireAdmin verifies role) —
// a tampered client cannot fake admin access.
router.use(authenticate, requireAdmin);

router.get('/users',      ctrl.listUsers);
router.put('/users/:id',  userValidation, validate, ctrl.updateUser);
router.get('/stats',      ctrl.stats);

module.exports = router;
