function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Duplicate entry - record already exists' });
  }

  if (err.name === 'ValidationError') {
    return res.status(422).json({ success: false, message: err.message });
  }

  const status  = err.status || 500;
  const message = process.env.NODE_ENV === 'production' && status === 500
    ? 'Internal server error'
    : err.message || 'Internal server error';

  res.status(status).json({ success: false, message });
}

function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
}

module.exports = { errorHandler, notFound };
