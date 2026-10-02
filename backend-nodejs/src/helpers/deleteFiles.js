import fs from "node:fs";
import path from "node:path";
import { UPLOAD_DIR } from "../config/paths.js";

function deleteFiles(files) {
  if (!files) return;

  const list = Array.isArray(files) ? files : [files];

  for (const file of list) {
    const name = typeof file === "string" ? file : file.filename;
    if (!name) continue;

    fs.unlink(path.join(UPLOAD_DIR, path.basename(name)), (err) => {
      if (err && err.code !== "ENOENT") {
        console.error("Faylni o'chirishda xatolik:", err.message);
      }
    });
  }
}

export { deleteFiles };
