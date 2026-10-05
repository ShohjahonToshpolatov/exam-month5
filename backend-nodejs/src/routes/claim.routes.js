import { Router } from "express";
import Joi from "joi";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { idSchema } from "../validation/common.validate.js";
import { createClaimSchema } from "../validation/claim.validate.js";
import { createClaim, getMyClaims, getItemClaims, updateClaim, } from "../controller/claim.controller.js";
const router = Router();
const statusSchema = Joi.object({
  status: Joi.string().valid("accepted", "rejected").required(),
});
router.get("/my", authMiddleware, getMyClaims);
router.post("/item/:id", authMiddleware, validate(idSchema, "params"), validate(createClaimSchema), createClaim);
router.get("/item/:id", authMiddleware, validate(idSchema, "params"), getItemClaims);
router.patch("/:id", authMiddleware, validate(idSchema, "params"), validate(statusSchema), updateClaim);
export default router;
