import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import friendRoutes from "./modules/friend/friend.routes.js";
import sessionRoutes from "./modules/session/session.routes.js";

import errorHandler from "./middlewares/error.middleware.js";
import requestLogger from "./middlewares/requestLogger.middleware.js";
import AppError from "./utils/appError.js";
import { globalLimiter } from "./middlewares/rateLimiter.js";

import "./config/env.validation.js";


const app = express();

// ======================
// Global Middlewares
// ======================
app.use(cors());
app.use(helmet());
app.use(requestLogger);
app.use(globalLimiter);
app.use(express.json({ limit: "10kb" }));
// ======================
// Routes
// ======================
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/sessions", sessionRoutes);


// ======================
// Health Check
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
