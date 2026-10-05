import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const ROOT_DIR = path.resolve(__dirname, "../../");
export const UPLOAD_DIR = path.join(ROOT_DIR, "uploads");
export const uploadsPath = UPLOAD_DIR;
