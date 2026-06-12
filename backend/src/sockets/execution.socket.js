import { touchRoom } from "../modules/room/room.service.js";

// Handles realtime execution console output and status sync within a room.
export const registerExecutionEvents = (io, socket) => {
  socket.on("execution-output", ({ roomId, output, isError }) => {
    touchRoom(roomId).catch((err) => console.error("Failed to touch room on execution output:", err));
    // Broadcast execution output to others in the room
    socket.to(roomId).emit("execution-output", {
      output,
      isError,
      userId: socket.user.userId,
    });
  });

  socket.on("execution-clear", ({ roomId }) => {
    // Clear execution console for all users in the room
    io.to(roomId).emit("execution-clear");
  });

  socket.on("execution-status", ({ roomId, isRunning }) => {
    touchRoom(roomId).catch((err) => console.error("Failed to touch room on execution status:", err));
    // Broadcast execution status to show loading state
    socket.to(roomId).emit("execution-status", {
      isRunning,
      userId: socket.user.userId,
    });
  });
};
