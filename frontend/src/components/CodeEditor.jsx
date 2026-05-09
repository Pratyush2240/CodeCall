import Editor from "@monaco-editor/react";
import "./CodeEditor.css";

/**
 * CodeEditor — Monaco wrapper for the collaborative room.
 *
 * Receives `value` and `onChange` from the parent (RoomSession)
 * so all sync logic stays in the hook layer.
 */
export default function CodeEditor({ value, onChange, isConnected }) {
  return (
    <div className="ce-wrapper">
      {/* Connection indicator */}
      <div className={`ce-conn-dot ${isConnected ? "ce-conn-dot--on" : ""}`}>
        <span className="ce-conn-pulse" />
        <span className="ce-conn-label">
          {isConnected ? "Live" : "Connecting…"}
        </span>
      </div>

      <Editor
        height="100%"
        defaultLanguage="javascript"
        theme="vs-dark"
        value={value}
        onChange={onChange}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
          fontLigatures: true,
          minimap: { enabled: true },
          wordWrap: "on",
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          bracketPairColorization: { enabled: true },
          renderLineHighlight: "all",
          tabSize: 2,
        }}
        loading={
          <div className="ce-loading">
            <div className="ce-loading-spinner" />
            <span>Loading editor…</span>
          </div>
        }
      />
    </div>
  );
}
