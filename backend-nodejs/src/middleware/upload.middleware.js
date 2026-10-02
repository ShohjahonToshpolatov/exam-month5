import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = "uploads";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const random = Math.floor(Math.random() * 100000);
    const extension = path.extname(file.originalname);

    cb(null, `${Date.now()}-${random}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const types = ["image/jpeg", "image/png", "image/webp"];

  if (!types.includes(file.mimetype)) {
    return cb(new Error("Faqat rasm yuklash mumkin"));
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
