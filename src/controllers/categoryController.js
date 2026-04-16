const { asyncHandler, AppError } = require('../middlewares/errorMiddleware');
const Category = require('../models/Category');
const logger = require('../utils/logger');
const { getPagination, getPaginationMeta } = require('../utils/paginationHelper');


const createCategory = asyncHandler(async (req, res, next) => {
  const { name, type, description } = req.body;

  // Check if category with same name and type already exists
  const existingCategory = await Category.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    type,
  });

  if (existingCategory) {
    return next(new AppError(`Category '${name}' already exists for type '${type}'`, 400));
  }

  const category = await Category.create({
    name,
    type,
    description,
  });

  logger.info(`User ${req.user._id} created category ${category._id}`, { action: 'CREATE_CATEGORY', userId: req.user._id, categoryId: category._id });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: {
      category,
    },
  });
});


const getCategories = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const { page: p, limit: l, skip } = getPagination(page, limit);

  const [total, categories] = await Promise.all([
    Category.countDocuments({ isActive: true }),
    Category.find({ isActive: true }).sort({ type: 1, name: 1 }).skip(skip).limit(l)
  ]);
  const meta = getPaginationMeta(total, p, l);

  res.status(200).json({
    success: true,
    data: {
      categories,
      meta,
    },
  });
});


const updateCategory = asyncHandler(async (req, res, next) => {
  const { name, type, description } = req.body;

  const fieldsToUpdate = { name, type, description };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  // Check for duplicate name + type combination if either is being changed
  if (fieldsToUpdate.name || fieldsToUpdate.type) {
    const existingCategory = await Category.findById(req.params.id);
    if (!existingCategory) {
      return next(new AppError('Category not found', 404));
    }

    const checkName = fieldsToUpdate.name || existingCategory.name;
    const checkType = fieldsToUpdate.type || existingCategory.type;

    const duplicate = await Category.findOne({
      _id: { $ne: req.params.id },
      name: { $regex: new RegExp(`^${checkName}$`, 'i') },
      type: checkType,
    });

    if (duplicate) {
      return next(new AppError(`Category '${checkName}' already exists for type '${checkType}'`, 400));
    }
  }

  const category = await Category.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  logger.info(`User ${req.user._id} updated category ${category._id}`, { action: 'UPDATE_CATEGORY', userId: req.user._id, categoryId: category._id });

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: {
      category,
    },
  });
});


const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  // Soft delete - deactivate instead of removing
  category.isActive = false;
  await category.save();

  logger.info(`User ${req.user._id} deleted category ${category._id}`, { action: 'DELETE_CATEGORY', userId: req.user._id, categoryId: category._id });

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
    data: {},
  });
});


const getCategoriesByType = asyncHandler(async (req, res, next) => {
  const { type } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const { page: p, limit: l, skip } = getPagination(page, limit);

  const [total, categories] = await Promise.all([
    Category.countDocuments({ type, isActive: true }),
    Category.find({ type, isActive: true }).sort({ name: 1 }).skip(skip).limit(l)
  ]);
  const meta = getPaginationMeta(total, p, l);

  res.status(200).json({
    success: true,
    data: {
      categories,
      meta,
    },
  });
});

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getCategoriesByType,
};
