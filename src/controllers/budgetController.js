const { asyncHandler, AppError } = require("../middlewares/errorMiddleware");
const Budget = require("../models/Budget");
const {
  calculateBatchSpending,
  calculateSingleSpending,
  enrichBudgetWithSpending,
} = require("../utils/budgetHelper");

/**
 * Create a budget
 */
const createBudget = asyncHandler(async (req, res, next) => {
  const { category, amount, month, year } = req.body;

  const existingBudget = await Budget.findOne({
    user: req.user._id,
    category,
    month,
    year,
  });

  if (existingBudget) {
    return next(
      new AppError(
        "Budget already exists for this category in this month/year",
        400,
      ),
    );
  }

  const budget = await Budget.create({
    user: req.user._id,
    category,
    amount,
    month,
    year,
  });

  res.status(201).json({
    success: true,
    message: "Budget created successfully",
    data: {
      budget,
    },
  });
});

/**
 * Get all budgets with spending enrichment and inline warnings
 */
const getBudgets = asyncHandler(async (req, res, next) => {
  const { month, year, category } = req.query;

  const query = { user: req.user._id };
  if (month) query.month = month;
  if (year) query.year = year;
  if (category) query.category = category;

  const budgets = await Budget.find(query)
    .populate("category", "name type")
    .sort({ year: -1, month: -1 });

  // Single batch aggregation instead of N+1 queries
  const spendingMap = await calculateBatchSpending(req.user._id, budgets);

  const warnings = [];
  const enrichedBudgets = budgets.map((budget) => {
    const categoryId = budget.category._id || budget.category;
    const key = `${categoryId}_${budget.month}_${budget.year}`;
    const totalSpent = spendingMap.get(key) || 0;
    const categoryName = budget.category?.name || "Unknown";

    const budgetObj = enrichBudgetWithSpending(
      budget.toJSON(),
      budget.amount,
      totalSpent,
      categoryName,
    );

    if (totalSpent > budget.amount) {
      warnings.push({
        budgetId: budget._id,
        category: categoryName,
        message: budgetObj.warning,
      });
    }

    return budgetObj;
  });

  const response = {
    success: true,
    data: {
      budgets: enrichedBudgets,
      count: enrichedBudgets.length,
    },
  };

  if (warnings.length > 0) {
    response.warnings = warnings;
  }

  res.status(200).json(response);
});

/**
 * Get a single budget by ID with spending enrichment
 */
const getBudgetById = asyncHandler(async (req, res, next) => {
  const budget = await Budget.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate("category", "name type");

  if (!budget) {
    return next(new AppError("Budget not found", 404));
  }

  const categoryId = budget.category._id || budget.category;
  const totalSpent = await calculateSingleSpending(
    req.user._id,
    categoryId,
    budget.month,
    budget.year,
  );

  const categoryName = budget.category?.name || "Unknown";
  const budgetObj = enrichBudgetWithSpending(
    budget.toJSON(),
    budget.amount,
    totalSpent,
    categoryName,
  );

  res.status(200).json({
    success: true,
    data: {
      budget: budgetObj,
    },
  });
});

/**
 * Update a budget
 */
const updateBudget = asyncHandler(async (req, res, next) => {
  const budget = await Budget.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!budget) {
    return next(new AppError("Budget not found", 404));
  }

  const { amount, month, year, category } = req.body;

  // Check for duplicate if category, month, or year is being changed
  if (category !== undefined || month !== undefined || year !== undefined) {
    const checkCategory = category || budget.category;
    const checkMonth = month !== undefined ? month : budget.month;
    const checkYear = year !== undefined ? year : budget.year;

    const duplicate = await Budget.findOne({
      _id: { $ne: req.params.id },
      user: req.user._id,
      category: checkCategory,
      month: checkMonth,
      year: checkYear,
    });

    if (duplicate) {
      return next(
        new AppError(
          "Budget already exists for this category in this month/year",
          400,
        ),
      );
    }
  }

  if (amount !== undefined) budget.amount = amount;
  if (month !== undefined) budget.month = month;
  if (year !== undefined) budget.year = year;
  if (category !== undefined) budget.category = category;

  await budget.save();

  res.status(200).json({
    success: true,
    message: "Budget updated successfully",
    data: {
      budget,
    },
  });
});

/**
 * Delete a budget
 */
const deleteBudget = asyncHandler(async (req, res, next) => {
  const budget = await Budget.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!budget) {
    return next(new AppError("Budget not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Budget deleted successfully",
    data: {},
  });
});

/**
 * Get budget alerts only — returns warnings for exceeded budgets
 */
const getBudgetAlerts = asyncHandler(async (req, res, next) => {
  const { month, year } = req.query;

  const query = { user: req.user._id };
  if (month) query.month = month;
  if (year) query.year = year;

  const budgets = await Budget.find(query).populate("category", "name type");

  // Single batch aggregation
  const spendingMap = await calculateBatchSpending(req.user._id, budgets);

  const alerts = [];

  for (const budget of budgets) {
    const categoryId = budget.category._id || budget.category;
    const key = `${categoryId}_${budget.month}_${budget.year}`;
    const totalSpent = spendingMap.get(key) || 0;

    if (totalSpent > budget.amount) {
      alerts.push({
        budgetId: budget._id,
        category: budget.category.name,
        budgetAmount: budget.amount,
        totalSpent,
        exceededBy: parseFloat((totalSpent - budget.amount).toFixed(2)),
        month: budget.month,
        year: budget.year,
        message: `You have exceeded your ${budget.category.name} budget by $${(totalSpent - budget.amount).toFixed(2)}`,
      });
    }
  }

  res.status(200).json({
    success: true,
    data: {
      alerts,
      count: alerts.length,
    },
  });
});

module.exports = {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetAlerts,
};
