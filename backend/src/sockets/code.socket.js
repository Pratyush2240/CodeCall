import { touchRoom } from "../modules/room/room.service.js";

// Handles realtime collaborative code editing within a room.
export const registerCodeEvents = (io, socket) => {
  socket.on("code-change", ({ roomId, code }) => {
    touchRoom(roomId).catch((err) => console.error("Failed to touch room on code change:", err));

    // Broadcast updated code to everyone else in the room
    socket.to(roomId).emit("code-update", {
      code,
      userId: socket.user.userId,
    });
  });

  socket.on("code-sync-request", ({ roomId }) => {
    // Used when a new user joins and needs the current code state
    socket.to(roomId).emit("code-sync-requested", {
      requesterId: socket.user.userId,
    });
  });

  socket.on("code-sync-response", ({ roomId, code }) => {
    // Send current code snapshot back to the room
    socket.to(roomId).emit("code-update", {
      code,
      synced: true,
    });
  });
};
