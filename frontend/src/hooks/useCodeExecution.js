import { useState, useCallback, useEffect } from "react";
import { executeCode } from "../api/execution";

export function useCodeExecution(socket, roomId, code) {
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  // Sync execution status and output from other users
  useEffect(() => {
    if (!socket) return;
    
    const onOutput = ({ output: newOutput }) => setOutput(newOutput);
    const onClear = () => setOutput("");
    const onStatus = ({ isRunning: remoteRunning }) => setIsRunning(remoteRunning);

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

  const syncOutput = useCallback((newOutput, isError = false) => {
    setOutput(newOutput);
    if (socket?.connected && roomId) {
      socket.emit("execution-output", { roomId, output: newOutput, isError });
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
    syncOutput("Executing...\n");

    try {
      const result = await executeCode(code, language);
      
      let finalOutput = "";
      if (result.compile_output) {
        finalOutput += `[Compiler]:\n${result.compile_output}\n`;
      }
      
      if (result.error) {
        finalOutput += `[Error]:\n${result.error}\n`;
      }
      
      if (result.output) {
        finalOutput += `${result.output}`;
      } else if (!result.error && !result.compile_output) {
        finalOutput += `Execution completed successfully with no output.\n`;
      }
      
      if (result.time || result.memory) {
         finalOutput += `\n\n--- Execution Details ---\nTime: ${result.time}s\nMemory: ${result.memory}KB`;
      }

      syncOutput(finalOutput, !!result.error);
    } catch (err) {
      syncOutput(`Execution Request Failed: ${err.response?.data?.message || err.message}`, true);
    } finally {
      setStatus(false);
    }
  }, [code, language, isRunning, setStatus, syncOutput]);

  return {
    language,
    setLanguage,
    output,
    isRunning,
    runCode,
    clearOutput
  };
}
