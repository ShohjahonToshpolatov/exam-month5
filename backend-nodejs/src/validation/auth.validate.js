import Joi from "joi";
const password = Joi.string()
  .min(8)
  .max(72)
  .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
  .required();
const registerSchema = Joi.object({
  full_name: Joi.string().trim().min(3).max(50).required(),
  email: Joi.string().trim().lowercase().email().max(100).required(),
  phone: Joi.string()
    .pattern(/^\+998\d{9}$/)
    .required(),
  password,
});
const verifySchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  code: Joi.string()
    .pattern(/^\d{6}$/)
    .required(),
});
const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});
const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});
const resetPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  code: Joi.string()
    .pattern(/^\d{6}$/)
    .required(),
  newPassword: password,
});
export { registerSchema, verifySchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, };
