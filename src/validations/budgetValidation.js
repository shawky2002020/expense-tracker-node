const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

const createBudgetSchema = Joi.object({
  category: objectId.required(),
  amount: Joi.number().positive().precision(2).required(),
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).required(),
});

const updateBudgetSchema = Joi.object({
  category: objectId,
  amount: Joi.number().positive().precision(2),
  month: Joi.number().integer().min(1).max(12),
  year: Joi.number().integer().min(2000),
}).min(1);

const budgetIdParamSchema = Joi.object({ id: objectId.required() });

const getBudgetsQuerySchema = Joi.object({
  month: Joi.number().integer().min(1).max(12),
  year: Joi.number().integer().min(2000),
  category: objectId,
});

// Local validate and validateParams
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errors = error.details.map(d => ({ field: d.path.join('.'), message: d.message }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  req.body = value;
  next();
};

const validateParams = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.params, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errors = error.details.map(d => ({ field: d.path.join('.'), message: d.message }));
    return res.status(400).json({ success: false, message: 'Parameter validation failed', errors });
  }
  req.params = value;
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errors = error.details.map(d => ({ field: d.path.join('.'), message: d.message }));
    return res.status(400).json({ success: false, message: 'Query validation failed', errors });
  }
  req.query = value;
  next();
};

module.exports = {
  createBudgetSchema,
  updateBudgetSchema,
  budgetIdParamSchema,
  getBudgetsQuerySchema,
  validate,
  validateParams,
  validateQuery,
};
