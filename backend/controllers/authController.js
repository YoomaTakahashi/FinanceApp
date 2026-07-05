const authService  = require('../services/authService');
const { pool }     = require('../config/database');
const { sanitizeUser } = require('../utils/helpers');
const { logActivity }  = require('../utils/logger');
const path = require('path');
const fs   = require('fs');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const user = await authService.register({ name, email, password });
    res.status(201).json({ success: true, message: 'Registration successful', data: user });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, password, rememberMe } = req.body;
    const result = await authService.login({ email, password, rememberMe });
    await logActivity(result.user.id, 'login', 'User logged in', req);
    res.json({ success: true, message: 'Login successful', data: result });
  } catch (err) { next(err); }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });
    const result = await authService.refreshAccessToken(refreshToken);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    await logActivity(req.user.id, 'logout', 'User logged out', req);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
}

async function logoutAll(req, res, next) {
  try {
    await authService.logoutAll(req.user.id);
    res.json({ success: true, message: 'Logged out from all devices' });
  } catch (err) { next(err); }
}

async function me(req, res) {
  res.json({ success: true, data: req.user });
}

async function updateProfile(req, res, next) {
  try {
    const { name } = req.body;
    await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id]);

    // Handle avatar upload
    if (req.files && req.files.avatar) {
      const file = req.files.avatar;
      const ext  = path.extname(file.name);
      const filename = `avatar_${req.user.id}_${Date.now()}${ext}`;
      const uploadsDir = path.join(__dirname, '..', 'uploads', 'avatars');
      const dest = path.join(uploadsDir, filename);

      // Remove old avatar file
      const [existing] = await pool.query('SELECT avatar FROM users WHERE id = ?', [req.user.id]);
      if (existing[0]?.avatar) {
        const oldFile = path.join(uploadsDir, path.basename(existing[0].avatar));
        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
      }

      await file.mv(dest);
      const avatarUrl = `/uploads/avatars/${filename}`;
      await pool.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, req.user.id]);
    }

    const [rows] = await pool.query('SELECT id, name, email, role, avatar, is_active, created_at FROM users WHERE id = ?', [req.user.id]);
    res.json({ success: true, message: 'Profile updated', data: rows[0] });
  } catch (err) { next(err); }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    await logActivity(req.user.id, 'change_password', 'Password changed', req);
    res.json({ success: true, message: 'Password changed successfully. Please log in again.' });
  } catch (err) { next(err); }
}

module.exports = { register, login, refresh, logout, logoutAll, me, updateProfile, changePassword };
