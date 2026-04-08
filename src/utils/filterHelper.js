/**
 * Helpers to build Mongoose query filters for transactions
 */
const buildTransactionFilter = ({ userId, type, category, startDate, endDate }) => {
  const filter = {};

  if (userId) filter.user = userId;
  if (type) filter.type = type;
  if (category) filter.category = category;

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) {
      // ensure end of day
      const d = new Date(endDate);
      d.setHours(23, 59, 59, 999);
      filter.date.$lte = d;
    }
  }

  return filter;
};

module.exports = {
  buildTransactionFilter,
};
