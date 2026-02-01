import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { registerCodeEvents } from "./code.socket.js";
import { registerWhiteboardEvents } from "./whiteboard.socket.js";
import { registerWebRTCEvents } from "./webrtc.socket.js";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  // JWT authentication for sockets
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Unauthorized socket connection"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.user.userId);

    socket.on("join-session", ({ sessionId }) => {
      socket.join(sessionId);

      socket.to(sessionId).emit("user-joined", {
        userId: socket.user.userId,
      });

      console.log(
        `User ${socket.user.userId} joined session ${sessionId}`
      );
    });

    registerCodeEvents(io, socket);
    registerWhiteboardEvents(io, socket);
     registerWebRTCEvents(io, socket);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.user.userId);
    });
  });
};
