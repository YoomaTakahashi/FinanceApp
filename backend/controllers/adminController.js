const adminService = require('../services/adminService');

async function listUsers(req, res, next) {
  try {
    const result = await adminService.listUsers(req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

async function updateUser(req, res, next) {
  try {
    const user = await adminService.updateUser(parseInt(req.params.id), req.user.id, req.body);
    res.json({ success: true, message: 'User updated', data: user });
  } catch (err) { next(err); }
}

async function stats(req, res, next) {
  try {
    const data = await adminService.getStats();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

module.exports = { listUsers, updateUser, stats };
