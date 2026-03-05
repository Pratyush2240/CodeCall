import logger from "../utils/logger.js";

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const correlationId = req.correlationId || "unknown";

  logger.info("Request received", {
    correlationId,
    method: req.method,
    url: req.originalUrl
  });

  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.info("Request completed", {
      correlationId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
};