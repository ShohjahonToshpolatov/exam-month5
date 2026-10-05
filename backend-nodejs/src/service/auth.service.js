import { transaction } from "../helpers/transaction.js";
import { pool } from "../config/pg.js";
import { generateOtp } from "../helpers/otp.js";
import { hashPassword, comparePassword } from "../helpers/hash.js";
import { createToken } from "../helpers/jwt.js";
import { sendOtpEmail } from "../helpers/mailer.js";
const saveOtp = async (userId, purpose) => {
  return transaction(async (client) => {
    await client.query("SELECT id FROM users WHERE id = $1 FOR UPDATE", [userId]);
    await client.query("UPDATE otp_codes SET is_used = true WHERE user_id = $1 AND purpose = $2 AND is_used = false", [userId, purpose]);
    const code = generateOtp();
    await client.query(`INSERT INTO otp_codes (user_id, code, purpose, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL '5 minutes')`, [userId, code, purpose]);
    return code;
  });
};
const sendCode = async (email, fullName, code, purpose) => {
  try {
    await sendOtpEmail(email, fullName, code, purpose);
  }
  catch (error) {
    console.error("Email yuborilmadi:", error.message);
    if (process.env.NODE_ENV === "production") {
      const mailError = new Error("Email yuborilmadi. Kodni qayta yuborishni sinab ko'ring");
      mailError.status = 503;
      throw mailError;
    }
  }
};
const devOtp = (code) => process.env.NODE_ENV !== "production" ? { otp: code } : {};
const register = async ({ full_name, email, phone, password }) => {
  const oldUser = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (oldUser.rows.length > 0) {
    const error = new Error("Bu email allaqachon ro'yxatdan o'tgan");
    error.status = 409;
    throw error;
  }
  const passwordHash = await hashPassword(password);
  const result = await pool.query(`INSERT INTO users (full_name, email, phone, password, is_verified) VALUES ($1, $2, $3, $4, false) RETURNING id, full_name, email, phone`, [full_name, email, phone, passwordHash]);
  const user = result.rows[0];
  const code = await saveOtp(user.id, "verify");
  await sendCode(user.email, user.full_name, code, "verify");
  return { user, code };
};
const verify = async ({ email, code }) => {
  return transaction(async (client) => {
    const userResult = await client.query("SELECT id, is_verified FROM users WHERE email = $1 FOR UPDATE", [email]);
    if (userResult.rows.length === 0) {
      const error = new Error("Foydalanuvchi topilmadi");
      error.status = 404;
      throw error;
    }
    const user = userResult.rows[0];
    if (user.is_verified) {
      const error = new Error("Email allaqachon tasdiqlangan");
      error.status = 400;
      throw error;
    }
    const codeResult = await client.query(`SELECT id FROM otp_codes WHERE user_id = $1 AND code = $2 AND purpose = 'verify' AND is_used = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`, [user.id, code]);
    if (codeResult.rows.length === 0) {
      const error = new Error("Kod noto'g'ri yoki muddati o'tgan");
      error.status = 400;
      throw error;
    }
    await client.query("UPDATE users SET is_verified = true WHERE id = $1", [
      user.id,
    ]);
    await client.query("UPDATE otp_codes SET is_used = true WHERE id = $1", [
      codeResult.rows[0].id,
    ]);
    return true;
  });
};
const resendCode = async ({ email }) => {
  const result = await pool.query("SELECT id, full_name, is_verified FROM users WHERE email = $1", [email]);
  if (result.rows.length === 0) {
    const error = new Error("Foydalanuvchi topilmadi");
    error.status = 404;
    throw error;
  }
  const user = result.rows[0];
  if (user.is_verified) {
    const error = new Error("Email allaqachon tasdiqlangan");
    error.status = 400;
    throw error;
  }
  const code = await saveOtp(user.id, "verify");
  await sendCode(email, user.full_name, code, "verify");
  return { ...devOtp(code) };
};
const login = async ({ email, password }) => {
  const result = await pool.query("SELECT id, full_name, email, phone, password, role, is_verified FROM users WHERE email = $1", [email]);
  if (result.rows.length === 0) {
    const error = new Error("Email yoki parol noto'g'ri");
    error.status = 401;
    throw error;
  }
  const user = result.rows[0];
  if (!user.is_verified) {
    const error = new Error("Avval emailingizni tasdiqlang");
    error.status = 403;
    throw error;
  }
  const correct = await comparePassword(password, user.password);
  if (!correct) {
    const error = new Error("Email yoki parol noto'g'ri");
    error.status = 401;
    throw error;
  }
  const token = createToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });
  delete user.password;
  return { token, user };
};
const forgotPassword = async ({ email }) => {
  const result = await pool.query("SELECT id, full_name FROM users WHERE email = $1", [email]);
  if (result.rows.length === 0) {
    const error = new Error("Foydalanuvchi topilmadi");
    error.status = 404;
    throw error;
  }
  const user = result.rows[0];
  const code = await saveOtp(user.id, "reset");
  await sendCode(email, user.full_name, code, "reset");
  return { ...devOtp(code) };
};
const resetPassword = async ({ email, code, newPassword }) => {
  return transaction(async (client) => {
    const userResult = await client.query("SELECT id FROM users WHERE email = $1 FOR UPDATE", [
      email,
    ]);
    if (userResult.rows.length === 0) {
      const error = new Error("Foydalanuvchi topilmadi");
      error.status = 404;
      throw error;
    }
    const userId = userResult.rows[0].id;
    const codeResult = await client.query(`SELECT id FROM otp_codes WHERE user_id = $1 AND code = $2 AND purpose = 'reset' AND is_used = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`, [userId, code]);
    if (codeResult.rows.length === 0) {
      const error = new Error("Kod noto'g'ri yoki muddati o'tgan");
      error.status = 400;
      throw error;
    }
    const passwordHash = await hashPassword(newPassword);
    await client.query("UPDATE users SET password = $1 WHERE id = $2", [
      passwordHash,
      userId,
    ]);
    await client.query("UPDATE otp_codes SET is_used = true WHERE id = $1", [
      codeResult.rows[0].id,
    ]);
    return true;
  });
};
const getMe = async (userId) => {
  const result = await pool.query("SELECT id, full_name, email, phone, role, is_verified FROM users WHERE id = $1", [userId]);
  if (result.rows.length === 0) {
    const error = new Error("Foydalanuvchi topilmadi");
    error.status = 404;
    throw error;
  }
  return result.rows[0];
};
export { register, verify, resendCode, login, forgotPassword, resetPassword, getMe, devOtp, };
