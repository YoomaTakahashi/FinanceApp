const txService  = require('../services/transactionService');
const notifSvc   = require('../services/notificationService');
const path       = require('path');

const SLIPS_DIR = path.join(__dirname, '..', 'uploads', 'slips');

async function list(req, res, next) {
  try {
    const result = await txService.getAll(req.user.id, req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

async function show(req, res, next) {
  try {
    const tx = await txService.getById(parseInt(req.params.id), req.user.id);
    if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.json({ success: true, data: tx });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const tx = await txService.create(req.user.id, req.body);

    if (req.files?.slip) {
      await txService.attachSlip(tx.id, req.user.id, req.files.slip, SLIPS_DIR);
    }

    // Notify on large expenses
    if (tx.type === 'expense' && parseFloat(tx.amount) >= 1000) {
      await notifSvc.create(req.user.id, {
        title:   'Large Expense Alert',
        message: `You recorded a large expense of $${parseFloat(tx.amount).toLocaleString()} for "${tx.title}"`,
        type:    'expense',
      });
    }

    const fresh = await txService.getById(tx.id, req.user.id);
    res.status(201).json({ success: true, message: 'Transaction created', data: fresh });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const tx = await txService.update(parseInt(req.params.id), req.user.id, req.body);

    if (req.files?.slip) {
      await txService.attachSlip(tx.id, req.user.id, req.files.slip, SLIPS_DIR);
    }

    const fresh = await txService.getById(tx.id, req.user.id);
    res.json({ success: true, message: 'Transaction updated', data: fresh });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await txService.softDelete(parseInt(req.params.id), req.user.id);
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (err) { next(err); }
}

async function restore(req, res, next) {
  try {
    await txService.restore(parseInt(req.params.id), req.user.id);
    res.json({ success: true, message: 'Transaction restored' });
  } catch (err) { next(err); }
}

async function duplicate(req, res, next) {
  try {
    const tx = await txService.duplicate(parseInt(req.params.id), req.user.id);
    res.status(201).json({ success: true, message: 'Transaction duplicated', data: tx });
  } catch (err) { next(err); }
}

async function uploadSlip(req, res, next) {
  try {
    if (!req.files?.slip) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const slipPath = await txService.attachSlip(parseInt(req.params.id), req.user.id, req.files.slip, SLIPS_DIR);
    res.json({ success: true, message: 'Slip uploaded', data: { slip_path: slipPath } });
  } catch (err) { next(err); }
}

async function deleteSlip(req, res, next) {
  try {
    await txService.removeSlip(parseInt(req.params.id), req.user.id, SLIPS_DIR);
    res.json({ success: true, message: 'Slip removed' });
  } catch (err) { next(err); }
}

module.exports = { list, show, create, update, remove, restore, duplicate, uploadSlip, deleteSlip };
