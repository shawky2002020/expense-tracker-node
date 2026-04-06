const express = require('express');
const router = express.Router();

// Import controllers
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  permanentDeleteUser,
  reactivateUser,
  getUserStats,
} = require('../controllers/userController');

// Import middlewares
const { authenticate } = require('../middlewares/authMiddleware');
const { requireAdmin, restrictToOwnOrAdmin } = require('../middlewares/roleMiddleware');

// Import validations
const {
  validate,
  validateQuery,
  validateParams,
  updateProfileSchema,
  getUsersQuerySchema,
  userIdParamSchema,
} = require('../validations/userValidation');

// All routes require authentication
router.use(authenticate);

// Admin only routes
router.get('/stats', requireAdmin, getUserStats);

// Routes that allow admin or own resource access
router.get('/', requireAdmin, validateQuery(getUsersQuerySchema), getUsers);
router.get('/:userId', validateParams(userIdParamSchema), restrictToOwnOrAdmin(), getUser);
router.put('/:userId', validateParams(userIdParamSchema), restrictToOwnOrAdmin(), validate(updateProfileSchema), updateUser);
router.put('/:userId/reactivate', requireAdmin, validateParams(userIdParamSchema), reactivateUser);

// Admin only routes for user management
router.delete('/:userId', requireAdmin, validateParams(userIdParamSchema), deleteUser);
router.delete('/:userId/permanent', requireAdmin, validateParams(userIdParamSchema), permanentDeleteUser);

module.exports = router;