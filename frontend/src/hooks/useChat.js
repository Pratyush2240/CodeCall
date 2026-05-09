import { useEffect, useState, useCallback, useRef } from "react";

/**
 * useChat — room-scoped realtime messaging over Socket.IO.
 *
 * @param {import("socket.io-client").Socket | null} socket
 * @param {string} roomId
 */
export function useChat(socket, roomId) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);

  // ── Listen for incoming messages ─────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receive-message", onMessage);
    return () => socket.off("receive-message", onMessage);
  }, [socket]);

  // ── Auto-scroll when messages change ─────────────────────
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // ── Send a message ───────────────────────────────────────
  const sendMessage = useCallback(
    (text) => {
      if (!socket?.connected || !roomId || !text.trim()) return;
      socket.emit("send-message", { roomId, text });
    },
    [socket, roomId]
  );

  return { messages, sendMessage, scrollRef };
}
