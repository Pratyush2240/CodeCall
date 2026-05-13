import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { registerCodeEvents } from "./code.socket.js";
import { registerWhiteboardEvents } from "./whiteboard.socket.js";
import { registerWebRTCEvents } from "./webrtc.socket.js";
import { registerPresenceEvents, trackJoin, trackDisconnect } from "./presence.socket.js";
import { registerChatEvents } from "./chat.socket.js";
import { registerExecutionEvents } from "./execution.socket.js";

/**
 * Initialise Socket.IO on the existing HTTP server.
 *
 * All realtime features use the backend's room system (roomId).
 * Feature handlers are registered as modular plugins — add new
 * files (e.g. chat.socket.js) and register them here.
 *
 * @param {import("http").Server} server
 * @returns {import("socket.io").Server}
 */
export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // ─── JWT authentication middleware ───────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      console.error("[socket] ❌ No token provided");
      return next(new Error("Authentication token missing"));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      console.error(`[socket] ❌ JWT verification failed: ${err.message}`);
      next(new Error("Unauthorized socket connection"));
    }
  });

  // ─── Connection handler ─────────────────────────────────
  io.on("connection", (socket) => {
    console.log(`⚡ Socket connected: ${socket.id} (user: ${socket.user.userId})`);

    // ── Join a room ───────────────────────────────────────
    socket.on("join-room", ({ roomId }) => {
      socket.join(roomId);

      // Track presence — broadcasts updated user list
      trackJoin(io, socket, roomId);

      console.log(`🏠 User ${socket.user.userId} joined room ${roomId}`);
    });

    // ── Feature-specific event handlers ───────────────────
    registerCodeEvents(io, socket);
    registerWhiteboardEvents(io, socket);
    registerWebRTCEvents(io, socket);
    registerPresenceEvents(io, socket);
    registerChatEvents(io, socket);
    registerExecutionEvents(io, socket);

    // ── Disconnect ────────────────────────────────────────
    socket.on("disconnect", () => {
      trackDisconnect(io, socket);
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
