const Joi = require("joi");

// Create category validation schema
const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(50).trim().required().messages({
    "string.empty": "Category name is required",
    "string.min": "Category name cannot be empty",
    "string.max": "Category name cannot exceed 50 characters",
    "any.required": "Category name is required",
  }),

  type: Joi.string().valid("income", "expense").required().messages({
    "string.empty": "Category type is required",
    "any.only": "Category type must be either income or expense",
    "any.required": "Category type is required",
  }),

  description: Joi.string().max(200).trim().allow("").messages({
    "string.max": "Description cannot exceed 200 characters",
  }),
});

// Update category validation schema
const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(50).trim().messages({
    "string.empty": "Category name cannot be empty",
    "string.min": "Category name cannot be empty",
    "string.max": "Category name cannot exceed 50 characters",
  }),

  type: Joi.string().valid("income", "expense").messages({
    "any.only": "Category type must be either income or expense",
  }),

  description: Joi.string().max(200).trim().allow("").messages({
    "string.max": "Description cannot exceed 200 characters",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

// Category ID parameter validation schema
const categoryIdParamSchema = Joi.object({
  id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid category ID format",
      "string.empty": "Category ID is required",
      "any.required": "Category ID is required",
    }),
});

// Category type parameter validation schema
const categoryTypeParamSchema = Joi.object({
  type: Joi.string().valid("income", "expense").required().messages({
    "any.only": "Type must be either income or expense",
    "string.empty": "Category type is required",
    "any.required": "Category type is required",
  }),
});

// Validation middleware function (body)
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
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
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Parameter validation failed",
        errors,
      });
    }

    req.params = value;
    next();
  };
};

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
  categoryTypeParamSchema,
  validate,
  validateParams,
};
