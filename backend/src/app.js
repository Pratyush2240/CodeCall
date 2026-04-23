import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import friendRoutes from "./modules/friend/friend.routes.js";
import sessionRoutes from "./modules/session/session.routes.js";
import healthRoutes from "./modules/health/health.routes.js";
import metricsRoutes from "./modules/metrics/metrics.routes.js";

import errorHandler from "./middlewares/error.middleware.js";
import correlationMiddleware from "./middlewares/correlation.middleware.js";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";
import { globalLimiter } from "./middlewares/rateLimiter.js";
import { metricsMiddleware } from "./middlewares/metrics.middleware.js";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";


import AppError from "./utils/appError.js";

import "./config/env.validation.js";

const app = express();

// ======================
// Global Middlewares
// ======================

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // In production, lock to CLIENT_URL env var
    if (process.env.NODE_ENV === "production") {
      return origin === process.env.CLIENT_URL
        ? callback(null, true)
        : callback(new Error("CORS: origin not allowed"));
    }

    // In development, allow any localhost / 127.0.0.1 port
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    return isLocalhost
      ? callback(null, true)
      : callback(new Error("CORS: origin not allowed"));
  },
  credentials: true, // required for withCredentials / cookie-based auth
}));
app.use(helmet());
app.use(express.json({ limit: "10kb" }));

app.use(correlationMiddleware);
app.use(requestLogger);
app.use(globalLimiter);
app.use(metricsMiddleware);

// ======================
// Monitoring
// ======================



// ======================
// API Routes
// ======================

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/sessions", sessionRoutes);

app.use("/api/health", healthRoutes);
app.use("/api/metrics", metricsRoutes);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// ======================
// Root Health Check
// ======================

app.get("/health", (_, res) => {
  res.json({
    status: "OK",
    service: "CodeCall Backend"
  });
});



// ======================
// 404 Handler
// ======================

app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// ======================
// Global Error Handler
// ======================

app.use(errorHandler);

export default app;