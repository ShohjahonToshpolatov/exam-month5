import * as authService from "../service/auth.service.js";

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: "Ro'yxatdan o'tdingiz. Emailingizni tasdiqlang",
      user: result.user,
      ...authService.devOtp(result.code),
    });
  } catch (error) {
    next(error);
  }
};

const verify = async (req, res, next) => {
  try {
    await authService.verify(req.body);
    res.json({ success: true, message: "Email muvaffaqiyatli tasdiqlandi" });
  } catch (error) {
    next(error);
  }
};

const resendCode = async (req, res, next) => {
  try {
    const result = await authService.resendCode(req.body);
    res.json({ success: true, message: "Yangi kod yuborildi", ...result });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body);
    res.json({
      success: true,
      message: "Parolni tiklash kodi yuborildi",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export {
  register,
  verify,
  resendCode,
  login,
  forgotPassword,
  resetPassword,
  getMe,
};
