const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Goal name is required'],
    trim: true,
    maxlength: [100, 'Goal name cannot exceed 100 characters'],
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [0, 'Target amount must be a positive number'],
  },
  savedAmount: {
    type: Number,
    default: 0,
    min: [0, 'Saved amount cannot be negative'],
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: '',
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for progress percentage
goalSchema.virtual('progress').get(function() {
  if (this.targetAmount === 0) return 100;
  return Math.min(Math.round((this.savedAmount / this.targetAmount) * 100 * 100) / 100, 100);
});

// Index for better query performance
goalSchema.index({ userId: 1, isCompleted: 1 });
goalSchema.index({ deadline: 1 });

// Pre-save middleware to auto-complete goal when saved amount reaches target
goalSchema.pre('save', function(next) {
  if (this.savedAmount >= this.targetAmount) {
    this.isCompleted = true;
  }
  next();
});

module.exports = mongoose.model('Goal', goalSchema);
