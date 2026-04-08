const { asyncHandler, AppError } = require("../middlewares/errorMiddleware");
const Transaction = require("../models/Transaction");
const { buildTransactionFilter } = require("../utils/filterHelper");
const {
  getPagination,
  getPaginationMeta,
} = require("../utils/paginationHelper");

/**
 * Create a transaction
 */
const createTransaction = asyncHandler(async (req, res, next) => {
  const {
    type,
    amount,
    currency,
    category,
    description,
    date,
    notes,
    isRecurring,
    frequency,
    nextDate,
  } = req.body;

  const transaction = await Transaction.create({
    user: req.user._id,
    type,
    amount,
    currency,
    category: category || null,
    description,
    date,
    notes,
    isRecurring: isRecurring || false,
    frequency: isRecurring ? frequency : null,
    nextDate: isRecurring ? nextDate : null,
  });

  res.status(201).json({
    success: true,
    message: "Transaction created successfully",
    data: { transaction },
  });
});

/**
 * Get list of transactions with filtering, sorting, pagination
 */
const getTransactions = asyncHandler(async (req, res, next) => {
  const {
    type,
    category,
    startDate,
    endDate,
    page = 1,
    limit = 10,
    sortBy = "date",
    sortOrder = "desc",
  } = req.query;

  const filter = buildTransactionFilter({
    userId: req.user._id,
    type,
    category,
    startDate,
    endDate,
  });
  const { page: p, limit: l, skip } = getPagination(page, limit);

  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [total, transactions] = await Promise.all([
    Transaction.countDocuments(filter),
    Transaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(l)
      .populate("category")
      .lean(),
  ]);

  const meta = getPaginationMeta(total, p, l);

  res.status(200).json({
    success: true,
    data: { transactions, meta },
  });
});

/**
 * Get single transaction
 */
const getTransactionById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  let transaction;
  if (req.user.role === "admin") {
    transaction = await Transaction.findById(id).populate("category");
  } else {
    transaction = await Transaction.findOne({
      _id: id,
      user: req.user._id,
    }).populate("category");
  }

  if (!transaction) return next(new AppError("Transaction not found", 404));

  res.status(200).json({ success: true, data: { transaction } });
});

/**
 * Update transaction
 */
const updateTransaction = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const transaction = await Transaction.findById(id);
  if (!transaction) return next(new AppError("Transaction not found", 404));

  if (
    req.user.role !== "admin" &&
    transaction.user.toString() !== req.user._id.toString()
  ) {
    return next(new AppError("Access denied", 403));
  }

  // If category provided and Category model exists, verify type
  // Category existence/type validation handled by route middleware

  Object.keys(req.body).forEach((key) => {
    transaction[key] = req.body[key];
  });

  await transaction.save();

  res
    .status(200)
    .json({
      success: true,
      message: "Transaction updated",
      data: { transaction },
    });
});

/**
 * Delete transaction
 */
const deleteTransaction = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const transaction = await Transaction.findById(id);
  if (!transaction) return next(new AppError("Transaction not found", 404));

  if (
    req.user.role !== "admin" &&
    transaction.user.toString() !== req.user._id.toString()
  ) {
    return next(new AppError("Access denied", 403));
  }

  await transaction.deleteOne();

  res.status(200).json({ success: true, message: "Transaction deleted" });
});

/**
 * Get summary totals (income / expense)
 */
const getTotalSummary = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const result = await Transaction.aggregate([
    { $match: { user: userId } },
    { $group: { _id: "$type", total: { $sum: "$amount" } } },
  ]);

  const summary = { income: 0, expense: 0 };
  result.forEach((r) => {
    if (r._id === "income") summary.income = r.total;
    if (r._id === "expense") summary.expense = r.total;
  });

  res.status(200).json({ success: true, data: { summary } });
});

/**
 * Stop a recurring transaction
 */
const stopRecurring = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const transaction = await Transaction.findById(id);
  if (!transaction) return next(new AppError("Transaction not found", 404));

  if (
    req.user.role !== "admin" &&
    transaction.user.toString() !== req.user._id.toString()
  ) {
    return next(new AppError("Access denied", 403));
  }

  if (!transaction.isRecurring) {
    return next(new AppError("Transaction is not recurring", 400));
  }

  transaction.isRecurring = false;
  transaction.frequency = null;
  transaction.nextDate = null;
  await transaction.save();

  res.status(200).json({
    success: true,
    message: "Recurring transaction stopped successfully",
    data: { transaction },
  });
});

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTotalSummary,
  stopRecurring,
};
