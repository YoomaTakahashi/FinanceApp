function paginate(page = 1, limit = 20) {
  const p      = Math.max(1, parseInt(page));
  const l      = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (p - 1) * l;
  return { page: p, limit: l, offset };
}

function buildPaginationMeta(total, page, limit) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext:    page < Math.ceil(total / limit),
    hasPrev:    page > 1,
  };
}

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

function formatAmount(amount) {
  return parseFloat(amount).toFixed(2);
}

module.exports = { paginate, buildPaginationMeta, sanitizeUser, formatAmount };
