// ─── Realtime cursor & selection synchronization ────────────────
// Relays cursor position and text selection events within a room.
// No server-side state is stored — pure broadcast relay.

export const registerCursorEvents = (io, socket) => {
  /**
   * cursor:move — a user's cursor position changed.
   * Payload: { roomId, position: { lineNumber, column }, userId? }
   */
  socket.on("cursor:move", ({ roomId, position }) => {
    socket.to(roomId).emit("cursor:move", {
      userId: socket.user.userId,
      position,
    });
  });

  /**
   * cursor:select — a user selected text.
   * Payload: { roomId, selection: { startLineNumber, startColumn, endLineNumber, endColumn } }
   */
  socket.on("cursor:select", ({ roomId, selection }) => {
    socket.to(roomId).emit("cursor:select", {
      userId: socket.user.userId,
      selection,
    });
  });

  /**
   * cursor:hide — a user stopped editing; hide their cursor.
   */
  socket.on("cursor:hide", ({ roomId }) => {
    socket.to(roomId).emit("cursor:hide", {
      userId: socket.user.userId,
    });
  });
};
