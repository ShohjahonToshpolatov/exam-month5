import Joi from "joi";
const updateRoleSchema = Joi.object({
  role: Joi.string().valid("user", "admin").required(),
});
const userFilterSchema = Joi.object({
  search: Joi.string().trim().allow(""),
  page: Joi.number().integer().positive().default(1),
  limit: Joi.number().integer().positive().max(50).default(10),
});
export { updateRoleSchema, userFilterSchema };
