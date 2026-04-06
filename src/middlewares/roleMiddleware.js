const { authorize } = require('./authMiddleware');

/**
 * Middleware to check if user is admin
 */
const requireAdmin = authorize('admin');

/**
 * Middleware to check if user is user or admin
 */
const requireUser = authorize('user', 'admin');

/**
 * Middleware to check if user is authenticated (any role)
 */
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }
  next();
};

/**
 * Middleware to restrict access to own resources or admin
 */
const restrictToOwnOrAdmin = (userIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const resourceUserId = req.params[userIdField] || req.body[userIdField] || req.query[userIdField];

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // User can only access their own resources
    if (req.user._id.toString() === resourceUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.',
    });
  };
};

/**
 * Middleware to check if user has specific permissions
 */
const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Define permissions based on roles
    const rolePermissions = {
      admin: ['read', 'write', 'delete', 'manage_users', 'manage_system'],
      user: ['read', 'write', 'delete_own'],
    };

    const userPermissions = rolePermissions[req.user.role] || [];

    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Insufficient permissions. Required: ${permission}`,
      });
    }

    next();
  };
};

/**
 * Middleware to check if user account is active
 */
const requireActiveAccount = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (!req.user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Account is deactivated. Please contact support.',
    });
  }

  next();
};

module.exports = {
  requireAdmin,
  requireUser,
  requireAuth,
  restrictToOwnOrAdmin,
  hasPermission,
  requireActiveAccount,
};