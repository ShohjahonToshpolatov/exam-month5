import fs from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR } from "../config/paths.js";
async function deleteFiles(files = []) {
  const list = Array.isArray(files) ? files : [files];
  for (const file of list) {
    const name = typeof file === "string" ? file : file?.filename;
    if (!name)
      continue;
    try {
      await fs.unlink(path.join(UPLOAD_DIR, path.basename(name)));
    }
    catch (error) {
      if (error.code !== "ENOENT")
        console.error(error.message);
    }
  }
}
export { deleteFiles };
