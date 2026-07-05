const { RateLimiterMemory } = require('rate-limiter-flexible');

const authLimiter = new RateLimiterMemory({
  points:   10,
  duration: 60,
});

const apiLimiter = new RateLimiterMemory({
  points:   200,
  duration: 60,
});

function authRateLimit(req, res, next) {
  const key = req.ip || 'unknown';
  authLimiter.consume(key)
    .then(() => next())
    .catch(() => {
      res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
    });
}

function apiRateLimit(req, res, next) {
  const key = req.user?.id || req.ip || 'unknown';
  apiLimiter.consume(key)
    .then(() => next())
    .catch(() => {
      res.status(429).json({ success: false, message: 'Rate limit exceeded.' });
    });
}

module.exports = { authRateLimit, apiRateLimit };
