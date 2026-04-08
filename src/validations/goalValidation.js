const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

const createGoalSchema = Joi.object({
  title: Joi.string().min(1).max(150).trim().required(),
  targetAmount: Joi.number().positive().precision(2).required(),
  currentAmount: Joi.number().min(0).precision(2).default(0),
  targetDate: Joi.date().required(),
  category: objectId.allow(null),
});

const updateGoalSchema = Joi.object({
  title: Joi.string().min(1).max(150).trim(),
  targetAmount: Joi.number().positive().precision(2),
  currentAmount: Joi.number().min(0).precision(2),
  targetDate: Joi.date(),
  category: objectId.allow(null),
}).min(1);

const goalIdParamSchema = Joi.object({ id: objectId.required() });

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

module.exports = {
  createGoalSchema,
  updateGoalSchema,
  goalIdParamSchema,
  validate,
  validateParams,
};
