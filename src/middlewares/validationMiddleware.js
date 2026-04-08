const { AppError } = require('./errorMiddleware');

// Validate request body
const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

  if (error) {
    const errors = error.details.map(detail => ({ field: detail.path.join('.'), message: detail.message }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  req.body = value;
  next();
};

// Validate query params
const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });

  if (error) {
    const errors = error.details.map(detail => ({ field: detail.path.join('.'), message: detail.message }));
    return res.status(400).json({ success: false, message: 'Query validation failed', errors });
  }

  req.query = value;
  next();
};

// Validate URL params
const validateParams = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.params, { abortEarly: false, stripUnknown: true });

  if (error) {
    const errors = error.details.map(detail => ({ field: detail.path.join('.'), message: detail.message }));
    return res.status(400).json({ success: false, message: 'Parameter validation failed', errors });
  }

  req.params = value;
  next();
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
};
