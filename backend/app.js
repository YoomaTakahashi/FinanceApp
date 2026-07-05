require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const compression = require('compression');
const fileUpload  = require('express-fileupload');
const path        = require('path');

const { testConnection } = require('./config/database');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const authRoutes         = require('./routes/auth');
const transactionRoutes  = require('./routes/transactions');
const categoryRoutes     = require('./routes/categories');
const dashboardRoutes    = require('./routes/dashboard');
const notificationRoutes = require('./routes/notifications');
const reportRoutes       = require('./routes/reports');
const settingsRoutes     = require('./routes/settings');
const adminRoutes        = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Security & Utility Middleware ───────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// FRONTEND_URL may be a single origin or a comma-separated list
// (e.g. production + preview URLs on Vercel). An entry may contain "*"
// as a wildcard for one URL segment, e.g. https://financeapp-*.vercel.app —
// keep the pattern project-specific; never allow all of *.vercel.app.
const originEntries = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean)
  .concat(['http://localhost:3000', 'http://localhost:3001']);

const originMatchers = originEntries.map((entry) => {
  if (!entry.includes('*')) return (origin) => origin === entry;
  const re = new RegExp('^' + entry.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[a-z0-9-]+') + '$', 'i');
  return (origin) => re.test(origin);
});

app.use(cors({
  origin(origin, cb) {
    if (!origin || originMatchers.some((match) => match(origin))) return cb(null, true);
    console.warn(`CORS blocked origin: ${origin} (allowed: ${originEntries.join(', ')})`);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(fileUpload({
  limits:      { fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 5 * 1024 * 1024 },
  abortOnLimit: true,
  useTempFiles: false,
  createParentPath: true,
}));

// ─── Static Files ─────────────────────────────────────────────
// uploads/* are gitignored, so they don't exist on a fresh deploy — create them
const fs = require('fs');
for (const dir of ['uploads/slips', 'uploads/avatars']) {
  fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ───────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/transactions',  transactionRoutes);
app.use('/api/categories',    categoryRoutes);
app.use('/api/dashboard',     dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports',       reportRoutes);
app.use('/api/settings',      settingsRoutes);
app.use('/api/admin',         adminRoutes);

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Finance API is running', timestamp: new Date().toISOString() });
});

// ─── Error Handling ───────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────
async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Finance API running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

start();

module.exports = app;
