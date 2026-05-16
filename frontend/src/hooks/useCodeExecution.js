import { useState, useCallback, useEffect, useRef } from "react";
import { executeCode } from "../api/execution";

export function useCodeExecution(socket, roomId, code) {
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const stdinRef = useRef("");

  useEffect(() => {
    if (!socket) return;
    const onOutput = ({ output: o }) => setOutput(o);
    const onClear = () => setOutput("");
    const onStatus = ({ isRunning: r }) => setIsRunning(r);
    socket.on("execution-output", onOutput);
    socket.on("execution-clear", onClear);
    socket.on("execution-status", onStatus);
    return () => {
      socket.off("execution-output", onOutput);
      socket.off("execution-clear", onClear);
      socket.off("execution-status", onStatus);
    };
  }, [socket]);

  const setStatus = useCallback((running) => {
    setIsRunning(running);
    if (socket?.connected && roomId) {
      socket.emit("execution-status", { roomId, isRunning: running });
    }
  }, [socket, roomId]);

  const syncOutput = useCallback((text) => {
    setOutput(text);
    if (socket?.connected && roomId) {
      socket.emit("execution-output", { roomId, output: text });
    }
  }, [socket, roomId]);

  const clearOutput = useCallback(() => {
    setOutput("");
    if (socket?.connected && roomId) {
      socket.emit("execution-clear", { roomId });
    }
  }, [socket, roomId]);

  const runCode = useCallback(async () => {
    if (!code || isRunning) return;

    setStatus(true);
    const stdin = stdinRef.current || "";
    syncOutput("$ Executing...\n");

    try {
      const result = await executeCode(code, language, stdin);
      let out = "";
      if (result.compile_output) out += result.compile_output + "\n";
      if (result.error) out += result.error + "\n";
      if (result.output) out += result.output;
      if (!out.trim()) out = "Program finished with no output.\n";
      out += `\n[Process exited] Time: ${result.time || "?"}s | Memory: ${result.memory || "?"}KB`;
      syncOutput(out);
    } catch (err) {
      syncOutput(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setStatus(false);
    }
  }, [code, language, isRunning, setStatus, syncOutput]);

  return { language, setLanguage, output, isRunning, runCode, clearOutput, stdinRef };
}
