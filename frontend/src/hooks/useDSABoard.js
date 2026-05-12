import { useState, useCallback, useEffect, useRef } from "react";

let _c = 0;
const uid = () => `dsa_${Date.now()}_${++_c}`;

/* ── Default data for each structure type ──────────────────── */
function defaultData(type) {
  switch (type) {
    case "array":      return { values: [1, 2, 3, 4, 5] };
    case "linkedlist": return { values: [1, 2, 3], doubly: false };
    case "stack":      return { values: [10, 20, 30] };
    case "queue":      return { values: [10, 20, 30] };
    case "bst":        return { values: [50, 30, 70, 20, 40, 60, 80] };
    case "graph":      return {
      nodes: [
        { id: uid(), label: "A", rx: 0, ry: 0 },
        { id: uid(), label: "B", rx: 120, ry: 0 },
        { id: uid(), label: "C", rx: 60, ry: 100 },
      ],
      edges: [],
    };
    case "label": return { text: "Label", fontSize: 18 };
    default:      return {};
  }
}

/**
 * useDSABoard — manages structured DSA visualizations + socket sync.
 */
export function useDSABoard(socket, roomId) {
  const [objects, setObjects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTool, setActiveTool] = useState(null); // null = select, else type
  const historyRef = useRef([]);
  const futureRef = useRef([]);
  const isRemote = useRef(false);

  /* ── Helpers ─────────────────────────────────────────────── */
  const pushHistory = useCallback((prev) => {
    historyRef.current.push(JSON.parse(JSON.stringify(prev)));
    if (historyRef.current.length > 40) historyRef.current.shift();
    futureRef.current = [];
  }, []);

  const sync = useCallback((next) => {
    if (isRemote.current || !socket?.connected || !roomId) return;
    socket.emit("whiteboard-dsa-sync", { roomId, objects: next });
  }, [socket, roomId]);

  // Throttled sync for drag moves (50ms) to avoid socket flooding
  const moveTimer = useRef(null);
  const syncThrottled = useCallback((next) => {
    if (moveTimer.current) return;
    moveTimer.current = setTimeout(() => {
      sync(next);
      moveTimer.current = null;
    }, 50);
  }, [sync]);

  /* ── CRUD ────────────────────────────────────────────────── */
  const addObject = useCallback((type, x, y) => {
    setObjects((prev) => {
      pushHistory(prev);
      const obj = { id: uid(), type, x, y, data: defaultData(type) };
      const next = [...prev, obj];
      sync(next);
      return next;
    });
    setActiveTool(null);
  }, [pushHistory, sync]);

  const removeObject = useCallback((id) => {
    setObjects((prev) => {
      pushHistory(prev);
      const next = prev.filter((o) => o.id !== id);
      sync(next);
      return next;
    });
    setSelectedId((s) => (s === id ? null : s));
  }, [pushHistory, sync]);

  const moveObject = useCallback((id, x, y) => {
    setObjects((prev) => {
      const next = prev.map((o) => (o.id === id ? { ...o, x, y } : o));
      syncThrottled(next);
      return next;
    });
  }, [syncThrottled]);

  const updateObjectData = useCallback((id, dataUpdater) => {
    setObjects((prev) => {
      pushHistory(prev);
      const next = prev.map((o) => {
        if (o.id !== id) return o;
        const newData = typeof dataUpdater === "function"
          ? dataUpdater(o.data) : { ...o.data, ...dataUpdater };
        return { ...o, data: newData };
      });
      sync(next);
      return next;
    });
  }, [pushHistory, sync]);

  /* ── Undo / Redo ─────────────────────────────────────────── */
  const undo = useCallback(() => {
    if (!historyRef.current.length) return;
    setObjects((prev) => {
      futureRef.current.push(JSON.parse(JSON.stringify(prev)));
      const restored = historyRef.current.pop();
      sync(restored);
      return restored;
    });
  }, [sync]);

  const redo = useCallback(() => {
    if (!futureRef.current.length) return;
    setObjects((prev) => {
      historyRef.current.push(JSON.parse(JSON.stringify(prev)));
      const restored = futureRef.current.pop();
      sync(restored);
      return restored;
    });
  }, [sync]);

  /* ── Socket listener ─────────────────────────────────────── */
  useEffect(() => {
    if (!socket) return;
    const onSync = ({ objects: remote }) => {
      isRemote.current = true;
      setObjects(remote);
      setTimeout(() => { isRemote.current = false; }, 0);
    };
    socket.on("whiteboard-dsa-sync", onSync);
    return () => socket.off("whiteboard-dsa-sync", onSync);
  }, [socket]);

  return {
    objects, selectedId, activeTool,
    setSelectedId, setActiveTool,
    addObject, removeObject, moveObject, updateObjectData,
    undo, redo,
    canUndo: historyRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
  };
}
