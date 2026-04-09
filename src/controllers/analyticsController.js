const { asyncHandler } = require("../middlewares/errorMiddleware");
const Transaction = require("../models/Transaction");

const buildMonthRange = (year, month) => {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  return { start, end };
};

const formatYearMonth = (date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const escapeCsv = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};


const getMonthlySpending = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const year = Number(req.query.year);
  const month = Number(req.query.month);

  const { start, end } = buildMonthRange(year, month);

  const previousMonthDate = new Date(Date.UTC(year, month - 2, 1));
  const previousYear = previousMonthDate.getUTCFullYear();
  const previousMonth = previousMonthDate.getUTCMonth() + 1;
  const { start: previousStart, end: previousEnd } = buildMonthRange(
    previousYear,
    previousMonth,
  );

  const [dailyExpenses, currentMonthTotalResult, previousMonthTotalResult] =
    await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: "expense",
            date: { $gte: start, $lt: end },
          },
        },
        {
          $group: {
            _id: { $dayOfMonth: "$date" },
            totalAmount: { $sum: "$amount" },
            transactionCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: "expense",
            date: { $gte: start, $lt: end },
          },
        },
        {
          $group: {
            _id: null,
            totalExpense: { $sum: "$amount" },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: "expense",
            date: { $gte: previousStart, $lt: previousEnd },
          },
        },
        {
          $group: {
            _id: null,
            totalExpense: { $sum: "$amount" },
          },
        },
      ]),
    ]);

  const totalExpense = currentMonthTotalResult[0]?.totalExpense || 0;
  const previousMonthExpense = previousMonthTotalResult[0]?.totalExpense || 0;

  let percentageChange = null;
  if (previousMonthExpense > 0) {
    percentageChange = ((totalExpense - previousMonthExpense) / previousMonthExpense) * 100;
  } else if (totalExpense > 0) {
    percentageChange = 100;
  }


  const dailyBreakdown = dailyExpenses.map((item) => ({
    day: item._id,
    totalAmount: Number(item.totalAmount.toFixed(2)),
    transactionCount: item.transactionCount,
  }));

  res.status(200).json({
    success: true,
    data: {
      period: { year, month },
      totalExpense: Number(totalExpense.toFixed(2)),
      dailyBreakdown,
      trend: {
        previousPeriod: { year: previousYear, month: previousMonth },
        previousMonthExpense: Number(previousMonthExpense.toFixed(2)),
        difference: Number((totalExpense - previousMonthExpense).toFixed(2)),
        percentageChange:
          percentageChange === null ? null : Number(percentageChange.toFixed(2)),
      },
    },
  });
});


const getSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const trendMonths = Number(req.query.trendMonths || 6);

  const trendStart = new Date();
  trendStart.setUTCHours(0, 0, 0, 0);
  trendStart.setUTCDate(1);
  trendStart.setUTCMonth(trendStart.getUTCMonth() - (trendMonths - 1));

  const [totalsResult, categoryBreakdown, monthlyTrendResult] = await Promise.all([
    Transaction.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$type", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    Transaction.aggregate([
      { $match: { user: userId, type: "expense" } },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $addFields: {
          categoryName: {
            $ifNull: [{ $arrayElemAt: ["$category.name", 0] }, "Uncategorized"],
          },
        },
      },
      {
        $group: {
          _id: "$categoryName",
          totalAmount: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: trendStart },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          income: {
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
          },
          expense: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
  ]);

  const summary = {
    income: 0,
    expense: 0,
    incomeCount: 0,
    expenseCount: 0,
  };

  totalsResult.forEach((item) => {
    if (item._id === "income") {
      summary.income = item.total;
      summary.incomeCount = item.count;
    }

    if (item._id === "expense") {
      summary.expense = item.total;
      summary.expenseCount = item.count;
    }
  });

  const monthlyTrend = monthlyTrendResult.map((item) => {
    const periodDate = new Date(Date.UTC(item._id.year, item._id.month - 1, 1));
    return {
      period: formatYearMonth(periodDate),
      income: Number(item.income.toFixed(2)),
      expense: Number(item.expense.toFixed(2)),
      net: Number((item.income - item.expense).toFixed(2)),
    };
  });

  res.status(200).json({
    success: true,
    data: {
      summary: {
        income: Number(summary.income.toFixed(2)),
        expense: Number(summary.expense.toFixed(2)),
        balance: Number((summary.income - summary.expense).toFixed(2)),
        incomeCount: summary.incomeCount,
        expenseCount: summary.expenseCount,
      },
      expenseByCategory: categoryBreakdown.map((item) => ({
        category: item._id,
        totalAmount: Number(item.totalAmount.toFixed(2)),
        transactionCount: item.transactionCount,
      })),
      trends: {
        months: trendMonths,
        monthly: monthlyTrend,
      },
    },
  });
});


const exportTransactionsCsv = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { startDate, endDate, type } = req.query;

  const filter = { user: userId };

  if (type) {
    filter.type = type;
  }

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const transactions = await Transaction.find(filter)
    .populate("category", "name")
    .sort({ date: -1 })
    .lean();

  const headers = [
    "date",
    "type",
    "amount",
    "currency",
    "category",
    "description",
    "notes",
    "isRecurring",
    "frequency",
  ];

  const rows = transactions.map((tx) => [
    new Date(tx.date).toISOString(),
    tx.type,
    Number(tx.amount).toFixed(2),
    tx.currency,
    tx.category?.name || "Uncategorized",
    tx.description || "",
    tx.notes || "",
    tx.isRecurring,
    tx.frequency || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=transactions-${Date.now()}.csv`,
  );

  res.status(200).send(csvContent);
});

module.exports = {
  getMonthlySpending,
  getSummary,
  exportTransactionsCsv,
};
