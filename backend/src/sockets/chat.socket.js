// Handles realtime room-scoped chat messages.
export const registerChatEvents = (io, socket) => {
  socket.on("send-message", ({ roomId, text }) => {
    if (!text || !text.trim()) return;

    const message = {
      id: `${socket.id}-${Date.now()}`,
      userId: socket.user.userId,
      text: text.trim(),
      timestamp: Date.now(),
    };

    // Broadcast to everyone in the room (including sender)
    io.to(roomId).emit("receive-message", message);
  });
};
