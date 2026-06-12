import { touchRoom } from "../modules/room/room.service.js";

// Handles realtime whiteboard sync within a room.
export const registerWhiteboardEvents = (io, socket) => {
  socket.on("whiteboard-draw", ({ roomId, stroke }) => {
    touchRoom(roomId).catch((err) => console.error("Failed to touch room on whiteboard draw:", err));
    // Broadcast stroke to others in the room
    socket.to(roomId).emit("whiteboard-draw", {
      stroke,
      userId: socket.user.userId,
    });
  });

  socket.on("whiteboard-clear", ({ roomId }) => {
    touchRoom(roomId).catch((err) => console.error("Failed to touch room on whiteboard clear:", err));
    // Clear whiteboard for all users in the room
    io.to(roomId).emit("whiteboard-clear");
  });

  // DSA structured visualization sync
  socket.on("whiteboard-dsa-sync", ({ roomId, objects }) => {
    touchRoom(roomId).catch((err) => console.error("Failed to touch room on whiteboard DSA sync:", err));
    socket.to(roomId).emit("whiteboard-dsa-sync", {
      objects,
      userId: socket.user.userId,
    });
  });
};
