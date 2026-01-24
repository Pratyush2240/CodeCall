import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);

app.get("/health", (_, res) => {
  res.json({ status: "OK", service: "CodeCall Backend" });
});

app.use(errorHandler);

export default app;
