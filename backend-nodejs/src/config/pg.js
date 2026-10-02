import { Pool } from "pg";
import { config } from "dotenv";

config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_DATABASE,
});

pool.on("error", (error) => {
  console.log(error.message);
});

export { pool };
