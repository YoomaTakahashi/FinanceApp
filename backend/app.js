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

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Security & Utility Middleware ───────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin:      [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001'],
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
}));

// ─── Static Files ─────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ───────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/transactions',  transactionRoutes);
app.use('/api/categories',    categoryRoutes);
app.use('/api/dashboard',     dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports',       reportRoutes);
app.use('/api/settings',      settingsRoutes);

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
