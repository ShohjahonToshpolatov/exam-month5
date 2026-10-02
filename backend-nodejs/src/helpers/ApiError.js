class ApiError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export { ApiError };
class ApiError extends Error {
  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = "Avtorizatsiya talab qilinadi") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Bu amalni bajarish huquqingiz yo'q") {
    return new ApiError(403, message);
  }

  static notFound(message = "Ma'lumot topilmadi") {
    return new ApiError(404, message);
  }

  static conflict(message) {
    return new ApiError(409, message);
  }
}

export { ApiError };
