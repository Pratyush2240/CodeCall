// Handles realtime whiteboard sync within a room.
export const registerWhiteboardEvents = (io, socket) => {
  socket.on("whiteboard-draw", ({ roomId, stroke }) => {
    // Broadcast stroke to others in the room
    socket.to(roomId).emit("whiteboard-draw", {
      stroke,
      userId: socket.user.userId,
    });
  });

  socket.on("whiteboard-clear", ({ roomId }) => {
    // Clear whiteboard for all users in the room
    io.to(roomId).emit("whiteboard-clear");
  });
};
