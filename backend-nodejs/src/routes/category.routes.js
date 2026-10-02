import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { idSchema } from "../validation/common.validate.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validation/category.validate.js";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controller/category.controller.js";

const router = Router();

router.get("/", getCategories);
router.get("/:id", validate(idSchema, "params"), getCategoryById);
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  validate(createCategorySchema),
  createCategory,
);
router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validate(idSchema, "params"),
  validate(updateCategorySchema),
  updateCategory,
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validate(idSchema, "params"),
  deleteCategory,
);

export default router;
