const { asyncHandler, AppError } = require('../middlewares/errorMiddleware');
const Goal = require('../models/Goal');
const { calculateProgress, getDaysRemaining, getGoalStatus } = require('../utils/goalProgressCalculator');


const createGoal = asyncHandler(async (req, res, next) => {
  const { name, targetAmount, deadline, description } = req.body;

  const goal = await Goal.create({
    userId: req.user._id,
    name,
    targetAmount,
    deadline,
    description,
  });

  res.status(201).json({
    success: true,
    message: 'Goal created successfully',
    data: {
      goal,
    },
  });
});


const getGoals = asyncHandler(async (req, res, next) => {
  const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });

  // Enrich goals with status info
  const enrichedGoals = goals.map(goal => {
    const goalObj = goal.toJSON();
    goalObj.status = getGoalStatus(goal);
    goalObj.daysRemaining = getDaysRemaining(goal.deadline);
    return goalObj;
  });

  res.status(200).json({
    success: true,
    data: {
      goals: enrichedGoals,
      count: enrichedGoals.length,
    },
  });
});


const getGoal = asyncHandler(async (req, res, next) => {
  const goal = await Goal.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!goal) {
    return next(new AppError('Goal not found', 404));
  }

  const goalObj = goal.toJSON();
  goalObj.status = getGoalStatus(goal);
  goalObj.daysRemaining = getDaysRemaining(goal.deadline);

  res.status(200).json({
    success: true,
    data: {
      goal: goalObj,
    },
  });
});


const updateGoal = asyncHandler(async (req, res, next) => {
  const { name, targetAmount, savedAmount, deadline, description } = req.body;

  const goal = await Goal.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!goal) {
    return next(new AppError('Goal not found', 404));
  }

  // Update fields if provided
  if (name !== undefined) goal.name = name;
  if (targetAmount !== undefined) goal.targetAmount = targetAmount;
  if (savedAmount !== undefined) goal.savedAmount = savedAmount;
  if (deadline !== undefined) goal.deadline = deadline;
  if (description !== undefined) goal.description = description;

  // Save triggers the pre-save hook (auto-complete check)
  await goal.save();

  const goalObj = goal.toJSON();
  goalObj.status = getGoalStatus(goal);
  goalObj.daysRemaining = getDaysRemaining(goal.deadline);

  res.status(200).json({
    success: true,
    message: 'Goal updated successfully',
    data: {
      goal: goalObj,
    },
  });
});


const deleteGoal = asyncHandler(async (req, res, next) => {
  const goal = await Goal.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!goal) {
    return next(new AppError('Goal not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Goal deleted successfully',
    data: {},
  });
});


const getGoalProgress = asyncHandler(async (req, res, next) => {
  const goal = await Goal.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!goal) {
    return next(new AppError('Goal not found', 404));
  }

  const progress = calculateProgress(goal.savedAmount, goal.targetAmount);
  const daysRemaining = getDaysRemaining(goal.deadline);
  const status = getGoalStatus(goal);
  const remainingAmount = Math.max(goal.targetAmount - goal.savedAmount, 0);

  res.status(200).json({
    success: true,
    data: {
      goalId: goal._id,
      name: goal.name,
      targetAmount: goal.targetAmount,
      savedAmount: goal.savedAmount,
      remainingAmount,
      progress,
      daysRemaining,
      status,
      isCompleted: goal.isCompleted,
      deadline: goal.deadline,
    },
  });
});

module.exports = {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  getGoalProgress,
};
