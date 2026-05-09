import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

/**
 * Create a new Socket.IO connection authenticated with the
 * JWT access token from localStorage.
 *
 * Returns `null` if no token is available (user not logged in).
 *
 * Key choices:
 *   - polling first → more reliable initial handshake (avoids
 *     "WebSocket closed before connection established" errors),
 *     then upgrades to websocket automatically.
 *   - autoConnect: false → caller controls when to connect.
 */
export function createSocket() {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    console.warn("[socket] No access token found — skipping connection");
    return null;
  }

  const socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["polling", "websocket"],   // polling first, then upgrade
    upgrade: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    autoConnect: false,                     // don't connect until .connect()
  });

  return socket;
}
