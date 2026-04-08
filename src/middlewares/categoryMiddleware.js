const Category = require('../models/Category');
const { AppError } = require('./errorMiddleware');

/**
 * Middleware to validate that a category exists and is active
 * Checks req.body.category or req.body.categoryId
 */
const validateCategoryExists = async (req, res, next) => {
  try {
    const categoryId = req.body.category || req.body.categoryId;

    if (!categoryId) {
      return next();
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    if (!category.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Category is no longer active',
      });
    }

    // Attach category to request for downstream use
    req.category = category;
    next();
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format',
      });
    }
    next(error);
  }
};

/**
 * Middleware to validate that category type matches transaction type
 * Expects req.category and req.body.type to be set
 */
const validateCategoryType = (req, res, next) => {
  if (!req.category || !req.body.type) {
    return next();
  }

  if (req.category.type !== req.body.type) {
    return res.status(400).json({
      success: false,
      message: `Category '${req.category.name}' is of type '${req.category.type}' and cannot be used for '${req.body.type}' transactions`,
    });
  }

  next();
};

module.exports = {
  validateCategoryExists,
  validateCategoryType,
};
