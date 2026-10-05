import fs from "node:fs";
import path from "node:path";
import { ROOT_DIR } from "../src/config/paths.js";
import { pool } from "../src/config/pg.js";

const files = ["schema.sql", "seed.sql"];

const run = async () => {
  for (const file of files) {
    const filePath = path.join(ROOT_DIR, "db", file);
    const sql = fs.readFileSync(filePath, "utf8");

    await pool.query(sql);

    console.log(`${file} bajarildi`);
  }

  await pool.end();
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
