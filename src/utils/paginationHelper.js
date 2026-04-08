/**
 * Simple pagination helper
 */
const getPagination = (page = 1, limit = 10) => {
  const p = parseInt(page, 10) || 1;
  const l = parseInt(limit, 10) || 10;
  const skip = (p - 1) * l;
  return { page: p, limit: l, skip };
};

const getPaginationMeta = (total, page = 1, limit = 10) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { total, page, limit, totalPages };
};

module.exports = {
  getPagination,
  getPaginationMeta,
};
