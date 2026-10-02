import { verifyToken } from "../helpers/jwt.js";

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Bearer token kerak",
    });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token noto'g'ri yoki muddati o'tgan",
    });
  }
};

export { authMiddleware };
