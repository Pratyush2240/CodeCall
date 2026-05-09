// WebRTC signaling events scoped to a room.
export const registerWebRTCEvents = (io, socket) => {

  socket.on("webrtc-offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("webrtc-offer", {
      offer,
      from: socket.user.userId,
    });
  });

  socket.on("webrtc-answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("webrtc-answer", {
      answer,
      from: socket.user.userId,
    });
  });

  socket.on("webrtc-ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("webrtc-ice-candidate", {
      candidate,
      from: socket.user.userId,
    });
  });

  socket.on("webrtc-leave", ({ roomId }) => {
    socket.to(roomId).emit("webrtc-peer-left", {
      userId: socket.user.userId,
    });
  });
};
