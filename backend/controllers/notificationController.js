const notifService = require('../services/notificationService');

async function list(req, res, next) {
  try {
    const result = await notifService.getAll(req.user.id, req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

async function markRead(req, res, next) {
  try {
    await notifService.markRead(parseInt(req.params.id), req.user.id);
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) { next(err); }
}

async function markAllRead(req, res, next) {
  try {
    await notifService.markAllRead(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await notifService.remove(parseInt(req.params.id), req.user.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) { next(err); }
}

async function unreadCount(req, res, next) {
  try {
    const count = await notifService.getUnreadCount(req.user.id);
    res.json({ success: true, data: { count } });
  } catch (err) { next(err); }
}

module.exports = { list, markRead, markAllRead, remove, unreadCount };
