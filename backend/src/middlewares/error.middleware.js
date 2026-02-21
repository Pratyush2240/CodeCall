import logger from "../utils/logger.js";

const sendErrorDev = (err, req, res) => {
  logger.warn(`${req.method} ${req.originalUrl} - ${err.message}`);

res.status(err.statusCode).json({
  status: err.status,
  code: err.code || "INTERNAL_SERVER_ERROR",
  message: err.message,
  stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    logger.warn(`${req.method} ${req.originalUrl} - ${err.message}`);

    res.status(err.statusCode).json({
      status: err.status,
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.message,
    });
  }

  logger.error(err);

  return res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "production") {
    sendErrorProd(err, req, res);
  } else {
    sendErrorDev(err, req, res);
  }
};

export default errorHandler;