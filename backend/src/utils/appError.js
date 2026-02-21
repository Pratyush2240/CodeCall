class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.code = code || null;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;