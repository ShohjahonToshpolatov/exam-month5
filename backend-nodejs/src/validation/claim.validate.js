import Joi from "joi";

const createClaimSchema = Joi.object({
  answer: Joi.string().trim().min(2).max(50).required(),
  message: Joi.string().trim().max(1000).allow(""),
});

const reportSchema = Joi.object({
  message: Joi.string().trim().min(2).max(1000).required(),
});

export { createClaimSchema, reportSchema };
