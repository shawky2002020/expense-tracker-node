const express = require('express');
const router = express.Router();

// Import controllers
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getCategoriesByType,
} = require('../controllers/categoryController');

// Import middlewares
const { authenticate } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');

// Import validations
const {
  validate,
  validateParams,
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
  categoryTypeParamSchema,
} = require('../validations/categoryValidation');

// All routes require authentication
router.use(authenticate);

// Public routes (all authenticated users)
router.get('/', getCategories);
router.get('/type/:type', validateParams(categoryTypeParamSchema), getCategoriesByType);

// Admin only routes
router.post('/', requireAdmin, validate(createCategorySchema), createCategory);
router.put('/:id', requireAdmin, validateParams(categoryIdParamSchema), validate(updateCategorySchema), updateCategory);
router.delete('/:id', requireAdmin, validateParams(categoryIdParamSchema), deleteCategory);

module.exports = router;
