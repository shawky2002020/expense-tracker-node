/**
 * Calculate progress percentage for a goal
 * @param {number} savedAmount - Amount saved so far
 * @param {number} targetAmount - Target amount to reach
 * @returns {number} Progress percentage (0-100)
 */
const calculateProgress = (savedAmount, targetAmount) => {
  if (!targetAmount || targetAmount <= 0) return 0;
  const progress = (savedAmount / targetAmount) * 100;
  return Math.min(Math.round(progress * 100) / 100, 100);
};

/**
 * Calculate days remaining until deadline
 * @param {Date} deadline - Goal deadline date
 * @returns {number} Number of days remaining (negative if overdue)
 */
const getDaysRemaining = (deadline) => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Determine goal status based on progress and deadline
 * @param {Object} goal - Goal object with savedAmount, targetAmount, deadline, isCompleted
 * @returns {string} Status: 'completed', 'overdue', 'on-track', or 'behind'
 */
const getGoalStatus = (goal) => {
  if (goal.isCompleted || goal.savedAmount >= goal.targetAmount) {
    return 'completed';
  }

  const daysRemaining = getDaysRemaining(goal.deadline);

  if (daysRemaining < 0) {
    return 'overdue';
  }

  // Calculate expected progress based on time elapsed
  const createdAt = new Date(goal.createdAt);
  const deadline = new Date(goal.deadline);
  const totalDuration = deadline.getTime() - createdAt.getTime();
  const elapsed = Date.now() - createdAt.getTime();

  if (totalDuration <= 0) return 'on-track';

  const expectedProgress = (elapsed / totalDuration) * 100;
  const actualProgress = calculateProgress(goal.savedAmount, goal.targetAmount);

  return actualProgress >= expectedProgress ? 'on-track' : 'behind';
};

module.exports = {
  calculateProgress,
  getDaysRemaining,
  getGoalStatus,
};
