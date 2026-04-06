const Joi = require('joi');
const { AppError } = require('../middlewares/errorMiddleware');

// Register validation schema
const registerSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.empty': 'Username is required',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 50 characters',
      'any.required': 'Username is required',
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'any.required': 'Password is required',
    }),

  firstName: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.empty': 'First name is required',
      'string.min': 'First name cannot be empty',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required',
    }),

  lastName: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.empty': 'Last name is required',
      'string.min': 'Last name cannot be empty',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required',
    }),

  role: Joi.string()
    .valid('user', 'admin')
    .default('user')
    .messages({
      'any.only': 'Role must be either user or admin',
    }),
});

// Login validation schema
const loginSchema = Joi.object({
  identifier: Joi.string()
    .required()
    .messages({
      'string.empty': 'Email or username is required',
      'any.required': 'Email or username is required',
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required',
    }),
});

// Change password validation schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'Current password is required',
      'any.required': 'Current password is required',
    }),

  newPassword: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 6 characters long',
      'string.max': 'New password cannot exceed 128 characters',
      'any.required': 'New password is required',
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'string.empty': 'Password confirmation is required',
      'any.required': 'Password confirmation is required',
    }),
});

// Forgot password validation schema
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
});

// Reset password validation schema
const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'string.empty': 'Reset token is required',
      'any.required': 'Reset token is required',
    }),

  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'any.required': 'Password is required',
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'string.empty': 'Password confirmation is required',
      'any.required': 'Password confirmation is required',
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

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validate,
};