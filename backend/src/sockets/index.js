import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { registerCodeEvents } from "./code.socket.js";
import { registerWhiteboardEvents } from "./whiteboard.socket.js";
import { registerWebRTCEvents } from "./webrtc.socket.js";
import { registerPresenceEvents, trackJoin, trackDisconnect } from "./presence.socket.js";
import { registerChatEvents } from "./chat.socket.js";
import { registerExecutionEvents } from "./execution.socket.js";
import { registerCursorEvents } from "./cursor.socket.js";

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
let ioInstance = null;

/**
 * Disconnect all sockets in a room and notify them of expiration.
 */
export const disconnectRoomSockets = (roomId, reason = "expired") => {
  if (ioInstance) {
    ioInstance.to(roomId).emit("room-expired", { reason });
    setTimeout(() => {
      if (ioInstance) {
        ioInstance.in(roomId).disconnectSockets(true);
      }
    }, 1000);
    console.log(`🔌 Disconnected all sockets in room ${roomId} due to: ${reason}`);
  }
};

/**
 * Emit an event to all socket connections of a specific user.
 */
export const emitToUser = (userId, event, data) => {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit(event, data);
    console.log(`📡 Emitted ${event} to user:${userId}`);
  }
};

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
  const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

  const io = new Server(server, {
    cors: {
      origin: allowedOrigin,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  ioInstance = io;

  // ─── JWT authentication middleware ───────────────────────
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      console.error("[socket] ❌ No token provided");
      return next(new Error("Authentication token missing"));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
      socket.user = decoded;

      // Always load the latest username from database to ensure real-time accuracy (e.g. after profile completion)
      try {
        const { default: prisma } = await import("../config/prisma.js");
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId || decoded.id },
          select: { username: true },
        });
        if (user) {
          socket.user.username = user.username;
        }
      } catch (dbErr) {
        console.error("[socket] Failed to load user username:", dbErr.message);
      }

      next();
    } catch (err) {
      console.error(`[socket] ❌ JWT verification failed: ${err.message}`);
      next(new Error("Unauthorized socket connection"));
    }
  });

  // ─── Connection handler ─────────────────────────────────
  io.on("connection", (socket) => {
    console.log(`⚡ Socket connected: ${socket.id} (user: ${socket.user.userId})`);

    // Automatically join the user-specific room for real-time notifications
    socket.join(`user:${socket.user.userId}`);

    // ── Join a room ───────────────────────────────────────
    socket.on("join-room", async ({ roomId }) => {
      try {
        const { getRoomById, touchRoom } = await import("../modules/room/room.service.js");
        await getRoomById(roomId, socket.user.userId);
        await touchRoom(roomId);

        socket.join(roomId);

        // Track presence — broadcasts updated user list
        trackJoin(io, socket, roomId);

        console.log(`🏠 User ${socket.user.userId} joined room ${roomId}`);
      } catch (err) {
        console.error(`[socket] ❌ Error joining room: ${err.message}`);
        socket.emit("error", { message: err.message || "Failed to join room" });
        if (err.statusCode === 410 || err.message.includes("expired") || err.message.includes("ended")) {
          socket.emit("room-expired");
        }
        socket.disconnect(true);
      }
    });

    // ── Feature-specific event handlers ───────────────────
    registerCodeEvents(io, socket);
    registerWhiteboardEvents(io, socket);
    registerWebRTCEvents(io, socket);
    registerPresenceEvents(io, socket);
    registerChatEvents(io, socket);
    registerExecutionEvents(io, socket);
    registerCursorEvents(io, socket);

    // ── Disconnect ────────────────────────────────────────
    socket.on("disconnect", () => {
      trackDisconnect(io, socket);
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
