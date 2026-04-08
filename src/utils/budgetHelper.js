const Transaction = require("../models/Transaction");

/**
 * Build date range for a given month/year
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {{ startDate: Date, endDate: Date }}
 */
const getMonthDateRange = (month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  return { startDate, endDate };
};

/**
 * Calculate spending for multiple budgets in a single aggregation (batch).
 * Groups spending by category for a given user within all relevant date ranges.
 *
 * @param {ObjectId} userId - The user's ID
 * @param {Array} budgets - Array of budget documents (must have category, month, year)
 * @returns {Map<string, number>} Map of "categoryId_month_year" -> totalSpent
 */
const calculateBatchSpending = async (userId, budgets) => {
  if (!budgets.length) return new Map();

  // Build $or conditions for each budget's date range + category
  const orConditions = budgets.map((budget) => {
    const categoryId = budget.category._id || budget.category;
    const { startDate, endDate } = getMonthDateRange(budget.month, budget.year);
    return {
      category: categoryId,
      date: { $gte: startDate, $lte: endDate },
    };
  });

  const results = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: "expense",
        $or: orConditions,
      },
    },
    {
      $group: {
        _id: {
          category: "$category",
          month: { $month: "$date" },
          year: { $year: "$date" },
        },
        totalSpent: { $sum: "$amount" },
      },
    },
  ]);

  // Build a lookup map: "categoryId_month_year" -> totalSpent
  const spendingMap = new Map();
  for (const result of results) {
    const key = `${result._id.category}_${result._id.month}_${result._id.year}`;
    spendingMap.set(key, result.totalSpent);
  }

  return spendingMap;
};

/**
 * Calculate spending for a single budget
 *
 * @param {ObjectId} userId - The user's ID
 * @param {ObjectId} categoryId - The category's ID
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {number} Total spent
 */
const calculateSingleSpending = async (userId, categoryId, month, year) => {
  const { startDate, endDate } = getMonthDateRange(month, year);

  const [result] = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: "expense",
        category: categoryId,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: "$amount" },
      },
    },
  ]);

  return result?.totalSpent || 0;
};

/**
 * Enrich a budget object with spending data
 *
 * @param {Object} budgetObj - Budget plain object (from toJSON)
 * @param {number} budgetAmount - The budget limit amount
 * @param {number} totalSpent - Total amount spent
 * @param {string} categoryName - Category name for warning message
 * @returns {Object} Enriched budget object
 */
const enrichBudgetWithSpending = (budgetObj, budgetAmount, totalSpent, categoryName) => {
  budgetObj.totalSpent = totalSpent;
  budgetObj.remainingAmount = Math.max(budgetAmount - totalSpent, 0);
  budgetObj.percentage = budgetAmount > 0
    ? Math.round((totalSpent / budgetAmount) * 100 * 100) / 100
    : 0;

  if (totalSpent > budgetAmount) {
    budgetObj.warning = `You have exceeded your ${categoryName} budget by $${(totalSpent - budgetAmount).toFixed(2)}`;
  }

  return budgetObj;
};

module.exports = {
  getMonthDateRange,
  calculateBatchSpending,
  calculateSingleSpending,
  enrichBudgetWithSpending,
};
