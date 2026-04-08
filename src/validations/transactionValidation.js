const Joi = require("joi");

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

const createTransactionSchema = Joi.object({
  type: Joi.string().valid("income", "expense").required(),
  amount: Joi.number().positive().precision(2).required(),
  currency: Joi.string().uppercase().trim().default("USD"),
  category: objectId.allow(null),
  description: Joi.string().max(500).allow("").trim(),
  date: Joi.date().required(),
  notes: Joi.string().max(2000).allow("").trim(),
  isRecurring: Joi.boolean().default(false),
  frequency: Joi.string()
    .valid("daily", "weekly", "monthly", "yearly")
    .when("isRecurring", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
  nextDate: Joi.date().when("isRecurring", {
    is: true,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});

const updateTransactionSchema = Joi.object({
  type: Joi.string().valid("income", "expense"),
  amount: Joi.number().positive().precision(2),
  currency: Joi.string().uppercase().trim(),
  category: objectId.allow(null),
  description: Joi.string().max(500).allow("").trim(),
  date: Joi.date(),
  notes: Joi.string().max(2000).allow("").trim(),
  isRecurring: Joi.boolean(),
  frequency: Joi.string().valid("daily", "weekly", "monthly", "yearly"),
  nextDate: Joi.date(),
}).min(1);

const getTransactionsQuerySchema = Joi.object({
  type: Joi.string().valid("income", "expense"),
  category: objectId,
  startDate: Joi.date(),
  endDate: Joi.date(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid("date", "amount", "createdAt").default("date"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

const transactionIdParamSchema = Joi.object({
  id: objectId.required(),
});

module.exports = {
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionsQuerySchema,
  transactionIdParamSchema,
};
