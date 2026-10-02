const errorMiddleware = (error, req, res, next) => {
  console.log(error.message);

  const status = error.status || 500;

  res.status(status).json({
    success: false,
    message: error.message || "Serverda xato",
    errors: error.errors || [],
  });
};

export { errorMiddleware };
