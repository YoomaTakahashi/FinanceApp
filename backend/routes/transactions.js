const router = require('express').Router();
const ctrl   = require('../controllers/transactionController');
const { authenticate } = require('../middlewares/auth');
const { validateUpload } = require('../middlewares/upload');
const { body, validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
}

const txValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('transaction_date').isDate().withMessage('Valid date is required'),
];

router.use(authenticate);

router.get('/',            ctrl.list);
router.get('/:id',         ctrl.show);
router.post('/',           validateUpload, txValidation, validate, ctrl.create);
router.put('/:id',         validateUpload, txValidation, validate, ctrl.update);
router.delete('/:id',      ctrl.remove);
router.post('/:id/restore',   ctrl.restore);
router.post('/:id/duplicate', ctrl.duplicate);
router.post('/:id/slip',   validateUpload, ctrl.uploadSlip);
router.delete('/:id/slip', ctrl.deleteSlip);

module.exports = router;
