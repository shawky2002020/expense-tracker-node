const express = require('express');
const router = express.Router();

const { authenticate } = require('../middlewares/authMiddleware');
const { validateBody, validateQuery, validateParams } = require('../middlewares/validationMiddleware');
const {
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionsQuerySchema,
  transactionIdParamSchema,
} = require('../validations/transactionValidation');

const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTotalSummary,
} = require('../controllers/transactionController');

const { validateCategoryExists, validateCategoryType } = require('../middlewares/categoryMiddleware');

// All routes require authentication
router.post('/', authenticate, validateBody(createTransactionSchema), validateCategoryExists, validateCategoryType, createTransaction);
router.get('/', authenticate, validateQuery(getTransactionsQuerySchema), getTransactions);
router.get('/summary/total', authenticate, getTotalSummary);
router.get('/:id', authenticate, validateParams(transactionIdParamSchema), getTransactionById);
router.put('/:id', authenticate, validateParams(transactionIdParamSchema), validateBody(updateTransactionSchema), validateCategoryExists, validateCategoryType, updateTransaction);
router.delete('/:id', authenticate, validateParams(transactionIdParamSchema), deleteTransaction);

module.exports = router;
