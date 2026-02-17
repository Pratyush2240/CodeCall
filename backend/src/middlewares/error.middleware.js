import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.statusCode >= 500) {
    logger.error(err);
  } else {
logger.warn(`${req.method} ${req.originalUrl} - ${err.message}`);
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};

export default errorHandler;
