import { useEffect, useRef, useState, useCallback } from "react";

/**
 * useCollaborativeCode — bidirectional code sync over Socket.IO.
 *
 * Uses a ref to track the latest known code to prevent infinite
 * loops without dropping keystrokes if the editor behaves unexpectedly.
 *
 * @param {import("socket.io-client").Socket | null} socket
 * @param {string} roomId
 * @param {{ onLocalChange?: () => void }} options
 * @returns {{ code, handleEditorChange }}
 */
export function useCollaborativeCode(socket, roomId, { onLocalChange } = {}) {
  const [code, setCode] = useState("// Start coding here…\n");
  const currentCode = useRef("// Start coding here…\n");

  // ── Listen for remote code updates ──────────────────────
  useEffect(() => {
    if (!socket) return;

    const onCodeUpdate = ({ code: incomingCode }) => {
      currentCode.current = incomingCode;
      setCode(incomingCode);
    };

    socket.on("code-update", onCodeUpdate);
    return () => socket.off("code-update", onCodeUpdate);
  }, [socket]);

  // ── Handler for local editor changes ────────────────────
  const handleEditorChange = useCallback(
    (newValue) => {
      // Prevent infinite loops if Monaco fires onChange for a remote update
      if (newValue === currentCode.current) {
        return;
      }

      currentCode.current = newValue;
      setCode(newValue);

      if (socket?.connected && roomId) {
        socket.emit("code-change", { roomId, code: newValue });
      }

      // Notify caller about local edits (used for typing indicators)
      onLocalChange?.();
    },
    [socket, roomId, onLocalChange]
  );

  return { code, handleEditorChange };
}
