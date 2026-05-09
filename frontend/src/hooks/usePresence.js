import { useEffect, useState, useCallback, useRef } from "react";

/**
 * usePresence — realtime participant presence over Socket.IO.
 *
 * Listens for:
 *   presence:update   → full user list for the room
 *   presence:typing   → someone started/stopped typing
 *   presence:user-left → cleanup typing state on leave
 *
 * Exposes:
 *   onlineUsers  — array of { userId, joinedAt }
 *   typingUsers  — Set<userId> currently typing
 *   emitTyping() — call on local keystrokes (auto-debounced)
 *
 * @param {import("socket.io-client").Socket | null} socket
 * @param {string} roomId
 */
export function usePresence(socket, roomId) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const typingTimeouts = useRef(new Map());

  // ── Socket listeners ───────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onPresenceUpdate = ({ users }) => {
      setOnlineUsers(users);
    };

    const onTyping = ({ userId, isTyping }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (isTyping) {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });

      // Auto-clear typing after 3s of silence
      if (isTyping) {
        const existing = typingTimeouts.current.get(userId);
        if (existing) clearTimeout(existing);
        typingTimeouts.current.set(
          userId,
          setTimeout(() => {
            setTypingUsers((prev) => {
              const next = new Set(prev);
              next.delete(userId);
              return next;
            });
            typingTimeouts.current.delete(userId);
          }, 3000)
        );
      }
    };

    const onUserLeft = ({ userId }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    socket.on("presence:update", onPresenceUpdate);
    socket.on("presence:typing", onTyping);
    socket.on("presence:user-left", onUserLeft);

    return () => {
      socket.off("presence:update", onPresenceUpdate);
      socket.off("presence:typing", onTyping);
      socket.off("presence:user-left", onUserLeft);
      typingTimeouts.current.forEach((t) => clearTimeout(t));
      typingTimeouts.current.clear();
    };
  }, [socket]);

  // ── Debounced typing emitter ───────────────────────────────
  const typingTimer = useRef(null);

  const emitTyping = useCallback(() => {
    if (!socket?.connected || !roomId) return;

    socket.emit("presence:typing", { roomId, isTyping: true });

    // Auto-send "stopped typing" after 2s of no calls
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("presence:typing", { roomId, isTyping: false });
    }, 2000);
  }, [socket, roomId]);

  return { onlineUsers, typingUsers, emitTyping };
}
