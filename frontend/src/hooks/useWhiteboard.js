import { useEffect, useRef, useState, useCallback } from "react";

/**
 * useWhiteboard — shared drawing canvas over Socket.IO.
 *
 * Manages:
 *   - Canvas 2D context drawing (pencil + eraser)
 *   - Emitting stroke segments to the room
 *   - Receiving remote strokes
 *   - Clear board (broadcast)
 *   - Brush size and color state
 *
 * @param {import("socket.io-client").Socket | null} socket
 * @param {string} roomId
 */
export function useWhiteboard(socket, roomId) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef(null);
  const initialized = useRef(false);

  const [tool, setTool] = useState("pencil"); // "pencil" | "eraser"
  const [brushSize, setBrushSize] = useState(3);
  const [color, setColor] = useState("#E6EDF3");

  // ── Initialise canvas context (runs only once) ───────────
  const initCanvas = useCallback((canvas) => {
    if (!canvas) return;
    canvasRef.current = canvas;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;

    // Only fill background on first init — not on re-renders
    if (!initialized.current) {
      canvas.width = canvas.parentElement?.clientWidth || canvas.width;
      canvas.height = canvas.parentElement?.clientHeight || canvas.height;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.fillStyle = "#161B22";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      initialized.current = true;
    }
  }, []);

  // ── Resize handler ───────────────────────────────────────
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    // Save current drawing
    const imageData = canvas.toDataURL();

    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    const ctx = ctxRef.current;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Restore drawing
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#161B22";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = imageData;
  }, []);

  useEffect(() => {
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  // ── Draw a stroke segment on the local canvas ────────────
  const drawStroke = useCallback((stroke) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(stroke.x0, stroke.y0);
    ctx.lineTo(stroke.x1, stroke.y1);
    ctx.strokeStyle = stroke.tool === "eraser" ? "#161B22" : stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.stroke();
    ctx.closePath();
  }, []);

  // ── Mouse / pointer handlers ─────────────────────────────
  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    // Normalise to canvas coords (handle CSS scaling)
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
  }, []);

  const onPointerDown = useCallback(
    (e) => {
      isDrawing.current = true;
      const pos = getPos(e);
      lastPoint.current = pos;
    },
    [getPos]
  );

  const onPointerMove = useCallback(
    (e) => {
      if (!isDrawing.current || !lastPoint.current) return;

      const pos = getPos(e);
      const stroke = {
        x0: lastPoint.current.x,
        y0: lastPoint.current.y,
        x1: pos.x,
        y1: pos.y,
        color,
        size: tool === "eraser" ? brushSize * 4 : brushSize,
        tool,
      };

      drawStroke(stroke);

      // Emit to room
      if (socket?.connected && roomId) {
        socket.emit("whiteboard-draw", { roomId, stroke });
      }

      lastPoint.current = pos;
    },
    [getPos, drawStroke, socket, roomId, color, brushSize, tool]
  );

  const onPointerUp = useCallback(() => {
    isDrawing.current = false;
    lastPoint.current = null;
  }, []);

  // ── Clear board ──────────────────────────────────────────
  const clearBoard = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    ctx.fillStyle = "#161B22";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (socket?.connected && roomId) {
      socket.emit("whiteboard-clear", { roomId });
    }
  }, [socket, roomId]);

  // ── Socket listeners (remote strokes + clear) ────────────
  useEffect(() => {
    if (!socket) return;

    const onRemoteDraw = ({ stroke }) => {
      drawStroke(stroke);
    };

    const onRemoteClear = () => {
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;
      if (!canvas || !ctx) return;
      ctx.fillStyle = "#161B22";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    socket.on("whiteboard-draw", onRemoteDraw);
    socket.on("whiteboard-clear", onRemoteClear);

    return () => {
      socket.off("whiteboard-draw", onRemoteDraw);
      socket.off("whiteboard-clear", onRemoteClear);
    };
  }, [socket, drawStroke]);

  return {
    initCanvas,
    resizeCanvas,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    clearBoard,
    tool,
    setTool,
    brushSize,
    setBrushSize,
    color,
    setColor,
  };
}
