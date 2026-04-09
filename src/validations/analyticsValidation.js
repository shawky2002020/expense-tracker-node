const Joi = require("joi");

const monthlySpendingQuerySchema = Joi.object({
  year: Joi.number().integer().min(1970).max(2100).required(),
  month: Joi.number().integer().min(1).max(12).required(),
});

const summaryQuerySchema = Joi.object({
  trendMonths: Joi.number().integer().min(1).max(24).default(6),
});

const exportCsvQuerySchema = Joi.object({
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref("startDate")),
  type: Joi.string().valid("income", "expense"),
});

module.exports = {
  monthlySpendingQuerySchema,
  summaryQuerySchema,
  exportCsvQuerySchema,
};
