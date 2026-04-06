const { asyncHandler, AppError } = require('../middlewares/errorMiddleware');
const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res, next) => {
  const { username, email, password, firstName, lastName, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [
      { email: email.toLowerCase() },
      { username }
    ]
  });

  if (existingUser) {
    if (existingUser.email === email.toLowerCase()) {
      return next(new AppError('Email already registered', 400));
    }
    if (existingUser.username === username) {
      return next(new AppError('Username already taken', 400));
    }
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    firstName,
    lastName,
    role: role || 'user',
  });

  // Generate token
  const token = generateToken({ id: user._id });

  // Remove password from response
  user.password = undefined;

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      token,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res, next) => {
  const { identifier, password } = req.body;

  // Check for user
  const user = await User.findByEmailOrUsername(identifier).select('+password');

  if (!user) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Check if account is active
  if (!user.isActive) {
    return next(new AppError('Account is deactivated', 401));
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Update last login
  await user.updateLastLogin();

  // Generate token
  const token = generateToken({ id: user._id });

  // Remove password from response
  user.password = undefined;

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user,
      token,
    },
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    email: req.body.email,
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
        { _id: { $ne: req.user._id } },
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

  const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user,
    },
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new AppError('Current password is incorrect', 400));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = generateToken({ id: user._id });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
    data: {
      token,
    },
  });
});

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: {},
  });
});

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Don't reveal if email exists or not for security
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  }

  // TODO: Implement password reset token generation and email sending
  // For now, just return success message

  res.status(200).json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
});

/**
 * @desc    Reset password
 * @route   PUT /api/auth/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, password } = req.body;

  // TODO: Implement token verification and password reset
  // For now, return not implemented

  res.status(501).json({
    success: false,
    message: 'Password reset functionality not implemented yet',
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
};