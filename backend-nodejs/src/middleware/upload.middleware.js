import multer from "multer";
import { randomUUID } from "node:crypto";
import { uploadsPath } from "../config/paths.js";
import fs from "fs";
const uploadPath = uploadsPath;
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const extensions = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
    cb(null, `${randomUUID()}${extensions[file.mimetype]}`);
  },
});
const fileFilter = (req, file, cb) => {
  const types = ["image/jpeg", "image/png", "image/webp"];
  if (!types.includes(file.mimetype)) {
    const error = new Error("Faqat JPG, PNG yoki WebP rasm yuklash mumkin");
    error.status = 400;
    return cb(error);
  }
  cb(null, true);
};
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});
export { upload };
