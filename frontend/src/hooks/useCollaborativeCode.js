import { useEffect, useRef, useState, useCallback } from "react";

/**
 * useCollaborativeCode — bidirectional code sync over Socket.IO.
 *
 * Handles the infinite-loop problem:
 *   1. Local edits  → emit "code-change"
 *   2. Remote edits → receive "code-update" → set state
 *   3. A `isRemoteUpdate` ref gates emissions so that applying a
 *      remote update does NOT re-emit back to the server.
 *
 * @param {import("socket.io-client").Socket | null} socket
 * @param {string} roomId
 * @returns {{ code, handleEditorChange }}
 */
export function useCollaborativeCode(socket, roomId) {
  const [code, setCode] = useState("// Start coding here…\n");
  const isRemoteUpdate = useRef(false);

  // ── Listen for remote code updates ──────────────────────
  useEffect(() => {
    if (!socket) return;

    const onCodeUpdate = ({ code: incomingCode }) => {
      isRemoteUpdate.current = true;
      setCode(incomingCode);
    };

    socket.on("code-update", onCodeUpdate);
    return () => socket.off("code-update", onCodeUpdate);
  }, [socket]);

  // ── Handler for local editor changes ────────────────────
  const handleEditorChange = useCallback(
    (newValue) => {
      // If this change was triggered by a remote update,
      // skip emitting to prevent infinite loops.
      if (isRemoteUpdate.current) {
        isRemoteUpdate.current = false;
        return;
      }

      setCode(newValue);

      if (socket?.connected && roomId) {
        socket.emit("code-change", { roomId, code: newValue });
      }
    },
    [socket, roomId]
  );

  return { code, handleEditorChange };
}
