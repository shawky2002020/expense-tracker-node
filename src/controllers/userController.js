const { asyncHandler, AppError } = require('../middlewares/errorMiddleware');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res, next) => {
  // Build query
  let query = {};

  // Filtering
  if (req.query.role) {
    query.role = req.query.role;
  }

  if (req.query.isActive !== undefined) {
    query.isActive = req.query.isActive === 'true';
  }

  // Searching
  if (req.query.search) {
    query.$or = [
      { username: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { firstName: { $regex: req.query.search, $options: 'i' } },
      { lastName: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Sorting
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  // Execute query
  const users = await User.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .select('-password');

  // Get total count for pagination
  const total = await User.countDocuments(query);

  // Pagination info
  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalUsers: total,
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination,
    },
  });
});

/**
 * @desc    Get single user
 * @route   GET /api/users/:userId
 * @access  Private
 */
const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:userId
 * @access  Private/Admin or Own Profile
 */
const updateUser = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    email: req.body.email,
    role: req.body.role,
    isActive: req.body.isActive,
    profilePicture: req.body.profilePicture,
    preferences: req.body.preferences,
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  // Check if email or username is being changed and if it's already taken
  if (fieldsToUpdate.email || fieldsToUpdate.username) {
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: req.params.userId } },
        {
          $or: [
            fieldsToUpdate.email ? { email: fieldsToUpdate.email.toLowerCase() } : {},
            fieldsToUpdate.username ? { username: fieldsToUpdate.username } : {},
          ]
        }
      ]
    });

    if (existingUser) {
      if (existingUser.email === fieldsToUpdate.email?.toLowerCase()) {
        return next(new AppError('Email already taken', 400));
      }
      if (existingUser.username === fieldsToUpdate.username) {
        return next(new AppError('Username already taken', 400));
      }
    }
  }

  const user = await User.findByIdAndUpdate(req.params.userId, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  logger.info(`User ${user._id} updated by ${req.user?._id || 'unknown'}`, { action: 'UPDATE_USER', targetUserId: user._id, performedBy: req.user?._id });

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: {
      user,
    },
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:userId
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Soft delete - deactivate instead of removing
  user.isActive = false;
  await user.save();

  logger.info(`User ${user._id} deactivated by ${req.user?._id || 'unknown'}`, { action: 'DEACTIVATE_USER', targetUserId: user._id, performedBy: req.user?._id });

  res.status(200).json({
    success: true,
    message: 'User deactivated successfully',
    data: {},
  });
});

/**
 * @desc    Permanently delete user
 * @route   DELETE /api/users/:userId/permanent
 * @access  Private/Admin
 */
const permanentDeleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.userId);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  logger.info(`User ${user._id} permanently deleted by ${req.user?._id || 'unknown'}`, { action: 'PERMANENT_DELETE_USER', targetUserId: user._id, performedBy: req.user?._id });

  res.status(200).json({
    success: true,
    message: 'User permanently deleted successfully',
    data: {},
  });
});

/**
 * @desc    Reactivate user
 * @route   PUT /api/users/:userId/reactivate
 * @access  Private/Admin
 */
const reactivateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { isActive: true },
    { new: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  logger.info(`User ${user._id} reactivated by ${req.user?._id || 'unknown'}`, { action: 'REACTIVATE_USER', targetUserId: user._id, performedBy: req.user?._id });

  res.status(200).json({
    success: true,
    message: 'User reactivated successfully',
    data: {
      user,
    },
  });
});

/**
 * @desc    Get user statistics
 * @route   GET /api/users/stats
 * @access  Private/Admin
 */
const getUserStats = asyncHandler(async (req, res, next) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        inactiveUsers: {
          $sum: { $cond: ['$isActive', 0, 1] }
        },
        adminUsers: {
          $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
        },
        regularUsers: {
          $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] }
        },
      }
    }
  ]);

  const userStats = stats[0] || {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
  };

  // Recent registrations (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentRegistrations = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });

  res.status(200).json({
    success: true,
    data: {
      ...userStats,
      recentRegistrations,
    },
  });
});

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  permanentDeleteUser,
  reactivateUser,
  getUserStats,
};