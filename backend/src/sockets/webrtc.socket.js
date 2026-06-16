// WebRTC signaling events scoped to a room.
export const registerWebRTCEvents = (io, socket) => {

  socket.on("webrtc-join", ({ roomId }) => {
    socket.to(roomId).emit("webrtc-peer-joined", {
      userId: socket.user.userId,
    });
  });

  socket.on("webrtc-offer", ({ roomId, target, offer }) => {
    socket.to(roomId).emit("webrtc-offer", {
      offer,
      target,
      from: socket.user.userId,
    });
  });

  socket.on("webrtc-answer", ({ roomId, target, answer }) => {
    socket.to(roomId).emit("webrtc-answer", {
      answer,
      target,
      from: socket.user.userId,
    });
  });

  socket.on("webrtc-ice-candidate", ({ roomId, target, candidate }) => {
    socket.to(roomId).emit("webrtc-ice-candidate", {
      candidate,
      target,
      from: socket.user.userId,
    });
  });

  socket.on("webrtc-leave", ({ roomId }) => {
    socket.to(roomId).emit("webrtc-peer-left", {
      userId: socket.user.userId,
    });
  });
};
