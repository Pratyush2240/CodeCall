import express from "express";
import cors from "cors";

import { errorHandler } from "./middlewares/error.middleware.js";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import friendRoutes from "./modules/friend/friend.routes.js";
import sessionRoutes from "./modules/session/session.routes.js";
//import codeExecutionRoutes from "./modules/codeExecution/codeExecution.routes.js";
// import testRoutes from "./modules/test/test.routes.js"; // Uncomment if migrated

const app = express();

// ======================
// Global Middlewares
// ======================
app.use(cors());
app.use(express.json());

// ======================
// Routes
// ======================
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/sessions", sessionRoutes);
//app.use("/api/execute", codeExecutionRoutes);
// app.use("/api/test", testRoutes);

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
// Global Error Handler
// ======================
app.use(errorHandler);

export default app;
