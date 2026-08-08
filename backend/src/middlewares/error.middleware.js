import logger from "../utils/logger.js";
import AppError from "../utils/appError.js";

const sendErrorDev = (err, req, res) => {
  logger.error(err.message, {
    correlationId: req.correlationId,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack
  });

  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    code: err.code || "INTERNAL_SERVER_ERROR",
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    logger.warn(err.message, {
      correlationId: req.correlationId,
      method: req.method,
      url: req.originalUrl
    });

    return res.status(err.statusCode || 500).json({
      status: err.status || "error",
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.message,
    });
  }

  logger.error("Unhandled error", {
    correlationId: req.correlationId,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack
  });

  return res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Prisma Known Request Errors
  if (err.code === "P2002") {
    const fields = err.meta?.target ? (Array.isArray(err.meta.target) ? err.meta.target.join(", ") : err.meta.target) : "field";
    error = new AppError(`A record with this ${fields} already exists.`, 400);
  } else if (err.code === "P2025") {
    error = new AppError("Record not found.", 404);
  } else if (err.name === "PrismaClientInitializationError") {
    error = new AppError("Database connection failed. Please check backend database configuration.", 500);
  }

  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "production") {
    sendErrorProd(error, req, res);
  } else {
    sendErrorDev(error, req, res);
  }
};

export default errorHandler;