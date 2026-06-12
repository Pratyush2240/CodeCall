import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { initSocket } from "./sockets/index.js";
import { expireStaleRooms } from "./modules/room/room.service.js";

const server = http.createServer(app);

initSocket(server);

// Periodically scan and expire stale rooms (every 1 minute)
setInterval(() => {
  expireStaleRooms().catch((err) => {
    console.error("[server] Error running auto-expiry scan:", err);
  });
}, 60 * 1000);

const PORT = env.PORT || 5000;

server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
