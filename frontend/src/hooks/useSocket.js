import { useEffect, useRef, useState } from "react";
import { createSocket } from "../socket/socket.js";

/**
 * useSocket — manages the socket lifecycle for a room.
 *
 * • Creates the socket with autoConnect: false
 * • Calls socket.connect() only after roomId is available
 * • Emits "join-room" once connected
 * • Disconnects + cleans up on unmount or roomId change
 *
 * @param {string} roomId
 */
export function useSocket(roomId) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const socket = createSocket();
    if (!socket) return;

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(`[socket] ✅ Connected: ${socket.id}`);
      setIsConnected(true);
      socket.emit("join-room", { roomId });
    });

    socket.on("disconnect", (reason) => {
      console.log(`[socket] 🔌 Disconnected: ${reason}`);
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("[socket] ❌ Connection error:", err.message);
      setIsConnected(false);
    });

    // Now actually connect
    socket.connect();

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  return { socket: socketRef.current, isConnected };
}
