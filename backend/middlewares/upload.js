const path = require('path');

const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_SIZE     = parseInt(process.env.UPLOAD_MAX_SIZE) || 5 * 1024 * 1024;

function validateUpload(req, res, next) {
  if (!req.files || !req.files.slip) {
    return next();
  }

  const file = req.files.slip;

  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return res.status(422).json({ success: false, message: 'Only JPG and PNG files are allowed' });
  }

  if (file.size > MAX_SIZE) {
    return res.status(422).json({ success: false, message: 'File size must not exceed 5MB' });
  }

  next();
}

function validateAvatar(req, res, next) {
  if (!req.files || !req.files.avatar) {
    return next();
  }

  const file = req.files.avatar;

  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return res.status(422).json({ success: false, message: 'Only JPG and PNG files are allowed' });
  }

  if (file.size > 2 * 1024 * 1024) {
    return res.status(422).json({ success: false, message: 'Avatar must not exceed 2MB' });
  }

  next();
}

module.exports = { validateUpload, validateAvatar };
