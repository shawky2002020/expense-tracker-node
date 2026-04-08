const Joi = require('joi');

// Create goal validation schema
const createGoalSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.empty': 'Goal name is required',
      'string.min': 'Goal name cannot be empty',
      'string.max': 'Goal name cannot exceed 100 characters',
      'any.required': 'Goal name is required',
    }),

  targetAmount: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Target amount must be a number',
      'number.positive': 'Target amount must be a positive number',
      'any.required': 'Target amount is required',
    }),

  deadline: Joi.date()
    .greater('now')
    .required()
    .messages({
      'date.base': 'Deadline must be a valid date',
      'date.greater': 'Deadline must be in the future',
      'any.required': 'Deadline is required',
    }),

  description: Joi.string()
    .max(500)
    .trim()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),
});

// Update goal validation schema
const updateGoalSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .messages({
      'string.empty': 'Goal name cannot be empty',
      'string.min': 'Goal name cannot be empty',
      'string.max': 'Goal name cannot exceed 100 characters',
    }),

  targetAmount: Joi.number()
    .positive()
    .messages({
      'number.base': 'Target amount must be a number',
      'number.positive': 'Target amount must be a positive number',
    }),

  savedAmount: Joi.number()
    .min(0)
    .messages({
      'number.base': 'Saved amount must be a number',
      'number.min': 'Saved amount cannot be negative',
    }),

  deadline: Joi.date()
    .messages({
      'date.base': 'Deadline must be a valid date',
    }),

  description: Joi.string()
    .max(500)
    .trim()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

// Goal ID parameter validation schema
const goalIdParamSchema = Joi.object({
  id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid goal ID format',
      'string.empty': 'Goal ID is required',
      'any.required': 'Goal ID is required',
    }),
});

// Validation middleware function (body)
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    req.body = value;
    next();
  };
};

// Params validation middleware
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Parameter validation failed',
        errors,
      });
    }

    req.params = value;
    next();
  };
};

module.exports = {
  createGoalSchema,
  updateGoalSchema,
  goalIdParamSchema,
  validate,
  validateParams,
};
