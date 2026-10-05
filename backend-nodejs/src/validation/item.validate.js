import Joi from "joi";
const itemSchema = Joi.object({
  type: Joi.string().valid("lost", "found").required(),
  title: Joi.string().trim().min(5).max(100).required(),
  description: Joi.string().trim().min(10).max(1000).required(),
  location: Joi.string().trim().min(3).max(150).required(),
  category_id: Joi.number().integer().positive().max(2147483647).required(),
  event_date: Joi.date().iso().max("now").required(),
  secret_question: Joi.when("type", {
    is: "found",
    then: Joi.string().trim().min(10).max(200).required(),
    otherwise: Joi.forbidden(),
  }),
  secret_answer: Joi.when("type", {
    is: "found",
    then: Joi.string().trim().min(2).max(50).required(),
    otherwise: Joi.forbidden(),
  }),
});
const updateItemSchema = Joi.object({
  title: Joi.string().trim().min(5).max(100),
  description: Joi.string().trim().min(10).max(1000),
  location: Joi.string().trim().min(3).max(150),
  category_id: Joi.number().integer().positive().max(2147483647),
}).min(1);
const itemFilterSchema = Joi.object({
  type: Joi.string().valid("lost", "found"),
  category_id: Joi.number().integer().positive().max(2147483647),
  search: Joi.string().trim(),
  page: Joi.number().integer().positive().default(1),
  limit: Joi.number().integer().positive().max(50).default(10),
});
export { itemSchema, updateItemSchema, itemFilterSchema };
