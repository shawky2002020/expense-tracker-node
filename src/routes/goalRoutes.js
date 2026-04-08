const express = require('express');
const router = express.Router();

// Import controllers
const {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  getGoalProgress,
} = require('../controllers/goalController');

// Import middlewares
const { authenticate } = require('../middlewares/authMiddleware');

// Import validations
const {
  validate,
  validateParams,
  createGoalSchema,
  updateGoalSchema,
  goalIdParamSchema,
} = require('../validations/goalValidation');

// All routes require authentication
router.use(authenticate);

// Goal routes (all user-owned)
router.post('/', validate(createGoalSchema), createGoal);
router.get('/', getGoals);
router.get('/progress/:id', validateParams(goalIdParamSchema), getGoalProgress);
router.get('/:id', validateParams(goalIdParamSchema), getGoal);
router.patch('/:id', validateParams(goalIdParamSchema), validate(updateGoalSchema), updateGoal);
router.delete('/:id', validateParams(goalIdParamSchema), deleteGoal);

module.exports = router;
