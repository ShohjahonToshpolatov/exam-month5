import { Pool } from "pg";
import { config } from "dotenv";
import path from "node:path";
import { ROOT_DIR } from "./paths.js";
config({ path: path.join(ROOT_DIR, ".env"), quiet: true });
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_DATABASE || process.env.DB_NAME,
  connectionTimeoutMillis: 5000,
});
pool.on("error", (error) => {
  console.log(error.message);
});
export { pool };
