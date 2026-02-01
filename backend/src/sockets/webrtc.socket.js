// WebRTC signaling events
export const registerWebRTCEvents = (io, socket) => {

  socket.on("webrtc-offer", ({ sessionId, offer }) => {
    socket.to(sessionId).emit("webrtc-offer", {
      offer,
      from: socket.user.userId,
    });
  });

  socket.on("webrtc-answer", ({ sessionId, answer }) => {
    socket.to(sessionId).emit("webrtc-answer", {
      answer,
      from: socket.user.userId,
    });
  });

  socket.on("webrtc-ice-candidate", ({ sessionId, candidate }) => {
    socket.to(sessionId).emit("webrtc-ice-candidate", {
      candidate,
      from: socket.user.userId,
    });
  });

  socket.on("webrtc-leave", ({ sessionId }) => {
    socket.to(sessionId).emit("webrtc-peer-left", {
      userId: socket.user.userId,
    });
  });
};
