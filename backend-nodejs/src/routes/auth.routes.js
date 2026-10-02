import { Router } from "express";

import { validate } from "../middleware/validate.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  register,
  verify,
  resendCode,
  login,
  forgotPassword,
  resetPassword,
  getMe,
} from "../controller/auth.controller.js";

import {
  registerSchema,
  verifySchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validation/auth.validate.js";

const router = Router();

router.post("/register", validate(registerSchema), register);

router.post("/verify", validate(verifySchema), verify);

router.post("/resend-code", validate(forgotPasswordSchema), resendCode);

router.post("/login", validate(loginSchema), login);

router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);

router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

router.get("/me", authMiddleware, getMe);

export default router;
