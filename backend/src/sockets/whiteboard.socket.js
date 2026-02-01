// Handles realtime whiteboard sync
export const registerWhiteboardEvents = (io, socket) => {
  socket.on("whiteboard-draw", ({ sessionId, stroke }) => {
    // Broadcast stroke to others in session
    socket.to(sessionId).emit("whiteboard-draw", {
      stroke,
      userId: socket.user.userId,
    });
  });

  socket.on("whiteboard-clear", ({ sessionId }) => {
    // Clear whiteboard for all users
    io.to(sessionId).emit("whiteboard-clear");
  });
};
