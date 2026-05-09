import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { initSocket } from "./sockets/index.js";

// ─── Create HTTP server from the Express app ───
const server = http.createServer(app);

// ─── Attach Socket.IO to the HTTP server ───
initSocket(server);

// ─── Start listening ───
const PORT = env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
