import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { initSocket } from "./sockets/index.js";

const PORT = env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
