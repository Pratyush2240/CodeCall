import { useRef, useCallback, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import "./CodeEditor.css";

const MONACO_LANG = {
  javascript: "javascript",
  python: "python",
  java: "java",
  cpp: "cpp",
};

export default function CodeEditor({
  value,
  onChange,
  isConnected,
  language = "javascript",
  setLanguage,
  output,
  isRunning,
  onRun,
  onClear,
  stdinRef,
}) {
  const editorRef = useRef(null);
  const [termOpen, setTermOpen] = useState(true);
  const [inputVal, setInputVal] = useState("");
  const termBodyRef = useRef(null);

  const handleMount = useCallback((editor) => {
    editorRef.current = editor;
    editor.focus();
  }, []);

  // Keep stdinRef in sync so the hook can read it on Run
  useEffect(() => {
    if (stdinRef) stdinRef.current = inputVal;
  }, [inputVal, stdinRef]);

  // Auto-scroll terminal to bottom on new output
  useEffect(() => {
    if (termBodyRef.current) {
      termBodyRef.current.scrollTop = termBodyRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="ide">
      {/* ── Toolbar ── */}
      <div className="ide-toolbar">
        <select
          className="ide-lang"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isRunning}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python 3</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
        <div className="ide-toolbar-right">
          <span className={`ide-live ${isConnected ? "ide-live--on" : ""}`}>
            <span className="ide-live-dot" />
            {isConnected ? "Live" : "Offline"}
          </span>
          <button
            className="ide-run"
            onClick={onRun}
            disabled={isRunning || !value?.trim()}
          >
            {isRunning ? <><span className="ide-spin" /> Running…</> : <>▶ Run</>}
          </button>
        </div>
      </div>

      {/* ── Monaco Editor ── */}
      <div className="ide-editor">
        <Editor
          height="100%"
          language={MONACO_LANG[language] || "plaintext"}
          theme="vs-dark"
          value={value}
          onChange={onChange}
          onMount={handleMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono','Fira Code','Consolas',monospace",
            fontLigatures: true,
            minimap: { enabled: true, scale: 1 },
            wordWrap: "off",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 8, bottom: 8 },
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            bracketPairColorization: { enabled: true },
            renderLineHighlight: "all",
            tabSize: 4,
            folding: true,
            glyphMargin: true,
            guides: { indentation: true, bracketPairs: true },
          }}
          loading={
            <div className="ide-loading">
              <div className="ide-loading-spin" />
              <span>Loading editor…</span>
            </div>
          }
        />
      </div>

      {/* ── Terminal ── */}
      <div className="ide-term">
        <div className="ide-term-bar">
          <span className="ide-term-title">Terminal</span>
          <div className="ide-term-actions">
            <button className="ide-term-btn" onClick={onClear} title="Clear output">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M5.75 1a.75.75 0 00-.75.75V3H1.75a.75.75 0 000 1.5h.792l.46 6.886c.086 1.29.996 2.364 2.274 2.364h5.448c1.278 0 2.188-1.074 2.274-2.364L13.458 4.5h.792a.75.75 0 000-1.5H11V1.75a.75.75 0 00-.75-.75h-4.5ZM9.5 3V2.5h-3V3h3ZM4.045 4.5l.453 6.79c.04.592.46.96.878.96h5.248c.418 0 .839-.368.878-.96l.453-6.79H4.045Z"/></svg>
            </button>
            <button className="ide-term-btn" onClick={() => setTermOpen(!termOpen)} title={termOpen ? "Minimize" : "Restore"}>
              {termOpen ? "—" : "□"}
            </button>
          </div>
        </div>
        {termOpen && (
          <div className="ide-term-split">
            <div className="ide-term-pane">
              <div className="ide-term-pane-head">Input (stdin)</div>
              <textarea
                className="ide-term-stdin"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={"Enter input values here, one per line\n\nExample:\n5\n10"}
                spellCheck="false"
              />
            </div>
            <div className="ide-term-pane">
              <div className="ide-term-pane-head">Output</div>
              <div className="ide-term-out-wrap" ref={termBodyRef}>
                <pre className="ide-term-out">{output || ""}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
