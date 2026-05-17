import { useEffect, useRef, useCallback } from "react";

const CURSOR_COLORS = [
  "#FF6B6B", "#51CF66", "#339AF0", "#FCC419",
  "#CC5DE8", "#FF922B", "#20C997", "#F06595",
];

function getColorForUser(userId) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

const THROTTLE_MS = 50;
const IDLE_TIMEOUT_MS = 3000;

/**
 * useCursors — collaborative cursor sync.
 *
 * Returns `markLocalEdit` — call this ONLY on local keystrokes.
 * Cursors are visible to others only while the user is actively editing.
 */
export function useCursors(socket, roomId, editor, currentUserId) {
  const decorationsRef = useRef(new Map());
  const lastEmitRef = useRef({ cursor: 0, selection: 0 });
  const idleTimerRef = useRef(null);
  const isActiveRef = useRef(false);

  /* ── Inject per-user CSS ── */
  const injectCursorCSS = useCallback((userId) => {
    const color = getColorForUser(userId);
    const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
    if (document.getElementById(`collab-style-${safeId}`)) return;

    const style = document.createElement("style");
    style.id = `collab-style-${safeId}`;
    style.textContent = `
      .collab-cursor--${safeId} {
        border-left: 2px solid ${color} !important;
        position: relative;
      }
      .collab-cursor--${safeId}::after {
        content: "${safeId.slice(0, 8)}";
        position: absolute;
        top: -18px; left: -1px;
        background: ${color}; color: #fff;
        font-size: 10px; font-weight: 600;
        font-family: 'Inter', sans-serif;
        padding: 1px 5px;
        border-radius: 3px 3px 3px 0;
        white-space: nowrap; pointer-events: none;
        z-index: 100; line-height: 14px;
      }
      .collab-sel--${safeId} { background: ${color}25 !important; border-radius: 2px; }
      .collab-line--${safeId} { background: ${color}0A !important; }
    `;
    document.head.appendChild(style);
  }, []);

  const clearUserDecorations = useCallback((userId) => {
    if (!editor) return;
    const oldIds = decorationsRef.current.get(userId) || [];
    if (oldIds.length > 0) {
      try { editor.deltaDecorations(oldIds, []); } catch { /* disposed */ }
      decorationsRef.current.delete(userId);
    }
  }, [editor]);

  /* ═══════════════════════════════════════════════════════
     markLocalEdit — called by the parent when the user
     makes a LOCAL edit (NOT when remote code arrives).
     This is what makes the cursor visible to others.
     ═══════════════════════════════════════════════════════ */
  const markLocalEdit = useCallback(() => {
    isActiveRef.current = true;

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      isActiveRef.current = false;
      if (socket?.connected && roomId) {
        socket.emit("cursor:hide", { roomId });
      }
    }, IDLE_TIMEOUT_MS);
  }, [socket, roomId]);

  /* ═══════════════════════════════════════════════════════
     OUTGOING — emit cursor/selection only while active
     ═══════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!editor || !socket?.connected || !roomId) return;

    const disposeCursor = editor.onDidChangeCursorPosition((e) => {
      if (!isActiveRef.current) return;
      const now = Date.now();
      if (now - lastEmitRef.current.cursor < THROTTLE_MS) return;
      lastEmitRef.current.cursor = now;

      socket.emit("cursor:move", {
        roomId,
        position: { lineNumber: e.position.lineNumber, column: e.position.column },
      });
    });

    const disposeSelection = editor.onDidChangeCursorSelection((e) => {
      if (!isActiveRef.current) return;
      const now = Date.now();
      if (now - lastEmitRef.current.selection < THROTTLE_MS) return;
      lastEmitRef.current.selection = now;

      const sel = e.selection;
      if (sel.startLineNumber === sel.endLineNumber && sel.startColumn === sel.endColumn) return;

      socket.emit("cursor:select", {
        roomId,
        selection: {
          startLineNumber: sel.startLineNumber, startColumn: sel.startColumn,
          endLineNumber: sel.endLineNumber, endColumn: sel.endColumn,
        },
      });
    });

    return () => {
      disposeCursor.dispose();
      disposeSelection.dispose();
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [editor, socket, roomId]);

  /* ═══════════════════════════════════════════════════════
     INCOMING — apply/remove decorations for remote users
     ═══════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!socket || !editor) return;

    const applyDecorations = (userId, cursorPos, selection) => {
      if (userId === currentUserId) return;
      injectCursorCSS(userId);

      const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
      const newDecorations = [];

      if (cursorPos) {
        newDecorations.push({
          range: { startLineNumber: cursorPos.lineNumber, startColumn: cursorPos.column,
                   endLineNumber: cursorPos.lineNumber, endColumn: cursorPos.column },
          options: { className: `collab-cursor--${safeId}`, stickiness: 1 },
        });
        newDecorations.push({
          range: { startLineNumber: cursorPos.lineNumber, startColumn: 1,
                   endLineNumber: cursorPos.lineNumber, endColumn: 1 },
          options: { isWholeLine: true, className: `collab-line--${safeId}`, stickiness: 1 },
        });
      }

      if (selection) {
        newDecorations.push({
          range: selection,
          options: { className: `collab-sel--${safeId}`, stickiness: 1 },
        });
      }

      const oldIds = decorationsRef.current.get(userId) || [];
      const newIds = editor.deltaDecorations(oldIds, newDecorations);
      decorationsRef.current.set(userId, newIds);
    };

    const onCursorMove = ({ userId, position }) => applyDecorations(userId, position, null);
    const onCursorSelect = ({ userId, selection }) => applyDecorations(userId, null, selection);
    const onCursorHide = ({ userId }) => clearUserDecorations(userId);
    const onUserLeft = ({ userId }) => clearUserDecorations(userId);

    socket.on("cursor:move", onCursorMove);
    socket.on("cursor:select", onCursorSelect);
    socket.on("cursor:hide", onCursorHide);
    socket.on("presence:user-left", onUserLeft);

    return () => {
      socket.off("cursor:move", onCursorMove);
      socket.off("cursor:select", onCursorSelect);
      socket.off("cursor:hide", onCursorHide);
      socket.off("presence:user-left", onUserLeft);

      decorationsRef.current.forEach((ids) => {
        try { editor.deltaDecorations(ids, []); } catch { /* disposed */ }
      });
      decorationsRef.current.clear();
    };
  }, [socket, editor, currentUserId, injectCursorCSS, clearUserDecorations]);

  return { markLocalEdit };
}
