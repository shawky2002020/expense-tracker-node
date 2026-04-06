const Joi = require('joi');

// Update profile validation schema
const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .messages({
      'string.empty': 'First name cannot be empty',
      'string.min': 'First name cannot be empty',
      'string.max': 'First name cannot exceed 50 characters',
    }),

  lastName: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .messages({
      'string.empty': 'Last name cannot be empty',
      'string.min': 'Last name cannot be empty',
      'string.max': 'Last name cannot exceed 50 characters',
    }),

  username: Joi.string()
    .min(3)
    .max(50)
    .trim()
    .messages({
      'string.empty': 'Username cannot be empty',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 50 characters',
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .messages({
      'string.empty': 'Email cannot be empty',
      'string.email': 'Please provide a valid email address',
    }),

  profilePicture: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': 'Profile picture must be a valid URL',
    }),

  preferences: Joi.object({
    currency: Joi.string()
      .valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD')
      .messages({
        'any.only': 'Invalid currency',
      }),

    language: Joi.string()
      .valid('en', 'es', 'fr', 'de', 'it', 'pt')
      .messages({
        'any.only': 'Invalid language',
      }),

    theme: Joi.string()
      .valid('light', 'dark')
      .messages({
        'any.only': 'Theme must be either light or dark',
      }),
  }).messages({
    'object.base': 'Preferences must be an object',
  }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

// Get users query validation schema
const getUsersQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.min': 'Page must be at least 1',
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),

  sortBy: Joi.string()
    .valid('createdAt', 'username', 'email', 'firstName', 'lastName')
    .default('createdAt')
    .messages({
      'any.only': 'Invalid sort field',
    }),

  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be asc or desc',
    }),

  search: Joi.string()
    .trim()
    .allow('')
    .messages({
      'string.base': 'Search must be a string',
    }),

  role: Joi.string()
    .valid('user', 'admin')
    .messages({
      'any.only': 'Role must be user or admin',
    }),

  isActive: Joi.boolean()
    .messages({
      'boolean.base': 'isActive must be a boolean',
    }),
});

// User ID parameter validation schema
const userIdParamSchema = Joi.object({
  userId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid user ID format',
      'string.empty': 'User ID is required',
      'any.required': 'User ID is required',
    }),
});

// Validation middleware function
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

// Query validation middleware
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Query validation failed',
        errors,
      });
    }

    req.query = value;
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
  updateProfileSchema,
  getUsersQuerySchema,
  userIdParamSchema,
  validate,
  validateQuery,
  validateParams,
};