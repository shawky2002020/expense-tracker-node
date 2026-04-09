const express = require("express");
const router = express.Router();

const { authenticate } = require("../middlewares/authMiddleware");
const { validateQuery } = require("../middlewares/validationMiddleware");
const {
  getMonthlySpending,
  getSummary,
  exportTransactionsCsv,
} = require("../controllers/analyticsController");
const {
  monthlySpendingQuerySchema,
  summaryQuerySchema,
  exportCsvQuerySchema,
} = require("../validations/analyticsValidation");

router.use(authenticate);

router.get(
  "/monthly-spending",
  validateQuery(monthlySpendingQuerySchema),
  getMonthlySpending,
);
router.get("/summary", validateQuery(summaryQuerySchema), getSummary);
router.get("/export/csv", validateQuery(exportCsvQuerySchema), exportTransactionsCsv);

module.exports = router;
