import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [sessionId, setSessionId] = useState("");
  const [inputSessionId, setInputSessionId] = useState("");
  const [code, setCode] = useState("");

  const createSession = async () => {
    const res = await fetch("http://localhost:5000/session/create", {
      method: "POST"
    });
    const data = await res.json();
    setSessionId(data.sessionId);
    socket.emit("join-session", { sessionId: data.sessionId });
  };

  const joinSession = () => {
    setSessionId(inputSessionId);
    socket.emit("join-session", { sessionId: inputSessionId });
  };

  useEffect(() => {
    socket.on("code-update", (updatedCode) => {
      setCode(updatedCode);
    });

    return () => socket.off("code-update");
  }, []);

  const handleChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    socket.emit("code-change", { sessionId, code: newCode });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Code Call – Live Coding</h2>

      {!sessionId && (
        <>
          <button onClick={createSession}>Create Session</button>

          <div style={{ marginTop: "10px" }}>
            <input
              placeholder="Enter Session ID"
              value={inputSessionId}
              onChange={(e) => setInputSessionId(e.target.value)}
            />
            <button onClick={joinSession}>Join Session</button>
          </div>
        </>
      )}

      {sessionId && (
        <>
          <p>Session ID: {sessionId}</p>
          <textarea
            rows={15}
            cols={80}
            value={code}
            onChange={handleChange}
            placeholder="Start typing code..."
          />
        </>
      )}
    </div>
  );
}

export default App;
