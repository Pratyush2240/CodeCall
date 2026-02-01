export const registerCodeEvents = (io, socket) => {
  socket.on("code-change", ({ sessionId, code }) => {
    // Broadcast updated code to everyone else in the session
    socket.to(sessionId).emit("code-update", {
      code,
      userId: socket.user.userId,
    });
  });

  socket.on("code-sync-request", ({ sessionId }) => {
    // Used when a new user joins and needs current code
    socket.to(sessionId).emit("code-sync-requested", {
      requesterId: socket.user.userId,
    });
  });

  socket.on("code-sync-response", ({ sessionId, code }) => {
    // Send current code to a specific user
    socket.to(sessionId).emit("code-update", {
      code,
      synced: true,
    });
  });
};
