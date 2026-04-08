const cron = require("node-cron");
const Transaction = require("../models/Transaction");

/**
 * Calculate the next occurrence date based on frequency
 */
const calculateNextDate = (currentDate, frequency) => {
  const next = new Date(currentDate);
  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
};

/**
 * Process all due recurring transactions
 */
const processRecurringTransactions = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Find all recurring transactions where nextDate is today or before
  const dueTransactions = await Transaction.find({
    isRecurring: true,
    nextDate: { $gte: today, $lt: tomorrow },
  });

  for (const txn of dueTransactions) {
    // Create new transaction (clone without recurring fields)
    await Transaction.create({
      user: txn.user,
      type: txn.type,
      amount: txn.amount,
      currency: txn.currency,
      category: txn.category,
      description: txn.description,
      date: new Date(),
      notes: txn.notes,
      isRecurring: false, // The clone is NOT recurring
    });
    // Advance nextDate on the template
    txn.nextDate = calculateNextDate(txn.nextDate, txn.frequency);
    await txn.save();
  }
  console.log(
    `[CRON] Processed ${dueTransactions.length} recurring transactions`,
  );
};

/**
 * Start the cron job — runs every day at midnight
 */
const startRecurringTransactionJob = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("[CRON] Running recurring transaction job...");
    try {
      await processRecurringTransactions();
    } catch (error) {
      console.error(
        "[CRON] Error processing recurring transactions:",
        error.message,
      );
    }
  });
  console.log("[CRON] Recurring transaction job scheduled (daily at midnight)");
};
module.exports = { startRecurringTransactionJob, processRecurringTransactions };
