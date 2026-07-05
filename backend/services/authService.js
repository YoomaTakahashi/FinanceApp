const bcrypt          = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { pool }        = require('../config/database');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshExpiryDate,
} = require('../config/jwt');
const { sanitizeUser } = require('../utils/helpers');

const SALT_ROUNDS = 12;

async function register({ name, email, password }) {
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length) throw Object.assign(new Error('Email already registered'), { status: 409 });

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  const [result] = await pool.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, hashed]
  );

  const userId = result.insertId;

  // Create default settings
  await pool.query('INSERT INTO settings (user_id) VALUES (?)', [userId]);

  // Welcome notification
  await pool.query(
    'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
    [userId, 'Welcome to FinanceApp!', 'Your account has been created successfully. Start tracking your finances today.', 'system']
  );

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
  return sanitizeUser(rows[0]);
}

async function login({ email, password, rememberMe = false }) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
  if (!rows.length) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const user  = rows[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const payload      = { id: user.id, email: user.email, role: user.role };
  const accessToken  = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const expiresAt = rememberMe ? getRefreshExpiryDate() : new Date(Date.now() + 24 * 60 * 60 * 1000);

  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [user.id, refreshToken, expiresAt]
  );

  return { user: sanitizeUser(user), accessToken, refreshToken };
}

async function refreshAccessToken(token) {
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw Object.assign(new Error('Invalid refresh token'), { status: 401 });
  }

  const [rows] = await pool.query(
    'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
    [token]
  );
  if (!rows.length) throw Object.assign(new Error('Refresh token expired or revoked'), { status: 401 });

  const [users] = await pool.query('SELECT * FROM users WHERE id = ? AND is_active = 1', [decoded.id]);
  if (!users.length) throw Object.assign(new Error('User not found'), { status: 401 });

  const user = users[0];

  // Rotate refresh token
  const newAccessToken  = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const newRefreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role });

  await pool.query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [user.id, newRefreshToken, getRefreshExpiryDate()]
  );

  return { accessToken: newAccessToken, refreshToken: newRefreshToken, user: sanitizeUser(user) };
}

async function logout(token) {
  if (token) await pool.query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
}

async function logoutAll(userId) {
  await pool.query('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
}

async function changePassword(userId, currentPassword, newPassword) {
  const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
  if (!rows.length) throw Object.assign(new Error('User not found'), { status: 404 });

  const valid = await bcrypt.compare(currentPassword, rows[0].password);
  if (!valid) throw Object.assign(new Error('Current password is incorrect'), { status: 400 });

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
  await pool.query('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
}

module.exports = { register, login, refreshAccessToken, logout, logoutAll, changePassword };
