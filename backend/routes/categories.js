const router = require('express').Router();
const ctrl   = require('../controllers/categoryController');
const { authenticate } = require('../middlewares/auth');
const { body, validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, message: errors.array()[0].msg });
  }
  next();
}

router.use(authenticate);
router.get('/',     ctrl.list);
router.get('/:id',  ctrl.show);
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('type').isIn(['income','expense','both']).withMessage('Invalid type'),
], validate, ctrl.create);
router.put('/:id', [
  body('name').trim().notEmpty().withMessage('Name is required'),
], validate, ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
