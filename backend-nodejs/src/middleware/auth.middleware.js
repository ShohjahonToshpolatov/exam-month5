import { verifyToken } from "../helpers/jwt.js";
import { pool } from "../config/pg.js";
const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token)
    return res.status(401).json({ success: false, message: "Avval tizimga kiring" });
  let payload;
  try {
    payload = verifyToken(token);
  }
  catch {
    return res.status(401).json({ success: false, message: "Token noto'g'ri yoki muddati o'tgan" });
  }
  const result = await pool.query("SELECT id, email, role, is_verified FROM users WHERE id = $1", [payload.id]);
  if (!result.rows[0]?.is_verified) {
    return res.status(401).json({ success: false, message: "Hisob topilmadi yoki tasdiqlanmagan" });
  }
  req.user = result.rows[0];
  next();
};
export { authMiddleware };
