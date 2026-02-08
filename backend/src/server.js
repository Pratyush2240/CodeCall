import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import authRoutes from "./modules/auth/auth.routes.js";

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);

// health check (optional but recommended)
app.get("/", (req, res) => {
  res.send("CodeCall Backend Running");
});

// start server
app.listen(env.PORT || 5000, () => {
  console.log(`🚀 Server running on port ${env.PORT || 5000}`);
});
