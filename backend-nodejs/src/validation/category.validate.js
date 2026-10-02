import Joi from "joi";

const createCategorySchema = Joi.object({
  name: Joi.string().trim().max(50).required(),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().trim().max(50).required(),
});

export { createCategorySchema, updateCategorySchema };
