import jwt from "jsonwebtoken";
const createToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET .env faylida berilmagan");
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
};
const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET .env faylida berilmagan");
  }
  return jwt.verify(token, process.env.JWT_SECRET);
};
export { createToken, verifyToken };
