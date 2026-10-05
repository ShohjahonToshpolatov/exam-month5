const errorMiddleware = (error, req, res, next) => {
  if (res.headersSent)
    return next(error);
  let status = error.status || error.statusCode || 500;
  let message = error.message || "Serverda xato";
  if (error.code === "23505") {
    status = 409;
    message = "Bu ma'lumot allaqachon mavjud";
  }
  if (error.code === "23503") {
    status = 400;
    message = "Bog'langan ma'lumot topilmadi yoki hali ishlatilmoqda";
  }
  if (error.name === "MulterError") {
    status = 400;
    message = error.code === "LIMIT_FILE_SIZE" ? "Rasm 2 MB dan oshmasin" : "Ko'pi bilan 5 ta rasm yuklang";
  }
  if (error.type === "entity.parse.failed")
    message = "JSON formati noto'g'ri";
  if (status >= 500) {
    console.error(error.message);
    message = "Server bilan bog'lanishda xatolik. Keyinroq urinib ko'ring";
  }
  res.status(status).json({ success: false, message, errors: error.errors || [] });
};
export { errorMiddleware };
