const express = require("express");
const router = express.Router();

const {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetAlerts,
} = require("../controllers/budgetController");
const { authenticate } = require("../middlewares/authMiddleware");
const { validateCategoryExists } = require("../middlewares/categoryMiddleware");
const {
  validate,
  validateParams,
  validateQuery,
  createBudgetSchema,
  updateBudgetSchema,
  budgetIdParamSchema,
  getBudgetsQuerySchema,
} = require("../validations/budgetValidation");

// All routes require authentication
router.use(authenticate);

router.post(
  "/",
  validate(createBudgetSchema),
  validateCategoryExists,
  createBudget,
);
router.get("/", validateQuery(getBudgetsQuerySchema), getBudgets);
router.get("/alerts", validateQuery(getBudgetsQuerySchema), getBudgetAlerts);
router.get("/:id", validateParams(budgetIdParamSchema), getBudgetById);
router.put(
  "/:id",
  validateParams(budgetIdParamSchema),
  validate(updateBudgetSchema),
  validateCategoryExists,
  updateBudget,
);
router.delete("/:id", validateParams(budgetIdParamSchema), deleteBudget);

module.exports = router;
