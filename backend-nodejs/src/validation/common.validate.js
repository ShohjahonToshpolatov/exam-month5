import Joi from "joi";

const idSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().positive().default(1),
  limit: Joi.number().integer().positive().max(50).default(10),
});

export { idSchema, paginationSchema };
