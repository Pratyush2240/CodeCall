import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import friendRoutes from "./routes/friend.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import codeExecutionRoutes from "./routes/codeExecution.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/friends", friendRoutes);
app.use("/sessions", sessionRoutes);
app.use("/execute", codeExecutionRoutes);


app.get("/health", (_, res) => {
  res.json({ status: "OK", service: "CodeCall Backend" });
});

app.use(errorHandler);

export default app;
