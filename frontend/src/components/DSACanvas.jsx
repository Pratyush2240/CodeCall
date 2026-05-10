import { useState, useRef, useCallback, useEffect } from 'react';
import { useDSABoard } from '../hooks/useDSABoard';
import './DSACanvas.css';

const CELL = 46, CELL_H = 38, NODE_R = 22, TREE_DY = 70;

/* ── BST builder ─────────────────────────────────────────────── */
function insertBST(root, val) {
  if (!root) return { val, left: null, right: null };
  if (val < root.val) root.left = insertBST(root.left, val);
  else root.right = insertBST(root.right, val);
  return root;
}
function buildBST(values) {
  let root = null;
  values.forEach(v => { root = insertBST(root, v); });
  return root;
}
function layoutBST(node, x, y, spread, out = []) {
  if (!node) return out;
  out.push({ val: node.val, x, y, left: node.left ? { x: x - spread, y: y + TREE_DY } : null, right: node.right ? { x: x + spread, y: y + TREE_DY } : null });
  layoutBST(node.left, x - spread, y + TREE_DY, spread / 2, out);
  layoutBST(node.right, x + spread, y + TREE_DY, spread / 2, out);
  return out;
}

/* ── DSA type toolbar items ──────────────────────────────────── */
const DSA_TOOLS = [
  { type: 'array', label: '[ ] Array' },
  { type: 'linkedlist', label: '→ List' },
  { type: 'stack', label: '⊞ Stack' },
  { type: 'queue', label: '⊟ Queue' },
  { type: 'bst', label: '⌄ BST' },
  { type: 'graph', label: '◎ Graph' },
  { type: 'label', label: 'Aa Label' },
];

/* ════════════════════════════════════════════════════════════════
   DSACanvas — SVG-based DSA visualization overlay
   ════════════════════════════════════════════════════════════════ */
export default function DSACanvas({ socket, roomId }) {
  const {
    objects, selectedId, activeTool,
    setSelectedId, setActiveTool,
    addObject, removeObject, moveObject, updateObjectData,
    undo, redo,
  } = useDSABoard(socket, roomId);

  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(null); // { id, offsetX, offsetY }
  const [editCell, setEditCell] = useState(null);  // { objId, idx, value }
  const [editPos, setEditPos] = useState(null);    // { x, y } screen coords
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(null);

  /* ── Keyboard shortcuts ───────────────────────────────────── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
      if (e.key === 'Delete' && selectedId) removeObject(selectedId);
      if (e.key === 'Escape') { setActiveTool(null); setSelectedId(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, undo, redo, removeObject, setActiveTool, setSelectedId]);

  /* ── SVG click → place object or deselect ─────────────────── */
  const onSvgClick = useCallback((e) => {
    if (e.target !== svgRef.current) return;
    if (activeTool) {
      const rect = svgRef.current.getBoundingClientRect();
      addObject(activeTool, e.clientX - rect.left - pan.x, e.clientY - rect.top - pan.y);
    } else {
      setSelectedId(null);
    }
  }, [activeTool, addObject, setSelectedId, pan]);

  /* ── Drag ──────────────────────────────────────────────────── */
  const startDrag = useCallback((e, id) => {
    e.stopPropagation();
    const obj = objects.find(o => o.id === id);
    if (!obj) return;
    setDragging({ id, offsetX: e.clientX - obj.x - pan.x, offsetY: e.clientY - obj.y - pan.y });
    setSelectedId(id);
  }, [objects, pan, setSelectedId]);

  const onPointerMove = useCallback((e) => {
    if (dragging) {
      moveObject(dragging.id, e.clientX - dragging.offsetX - pan.x, e.clientY - dragging.offsetY - pan.y);
    } else if (panning) {
      setPan({ x: e.clientX - panning.sx, y: e.clientY - panning.sy });
    }
  }, [dragging, panning, moveObject, pan]);

  const onPointerUp = useCallback(() => {
    setDragging(null);
    setPanning(null);
  }, []);

  const onBgPointerDown = useCallback((e) => {
    if (e.target === svgRef.current && !activeTool) {
      setPanning({ sx: e.clientX - pan.x, sy: e.clientY - pan.y });
    }
  }, [activeTool, pan]);

  /* ── Inline edit ───────────────────────────────────────────── */
  const startEdit = useCallback((objId, idx, value, screenX, screenY) => {
    setEditCell({ objId, idx, value: String(value) });
    setEditPos({ x: screenX, y: screenY });
  }, []);

  const commitEdit = useCallback(() => {
    if (!editCell) return;
    const { objId, idx, value } = editCell;
    const obj = objects.find(o => o.id === objId);
    if (!obj) { setEditCell(null); return; }

    if (obj.type === 'label') {
      updateObjectData(objId, { text: value });
    } else if (obj.type === 'graph') {
      updateObjectData(objId, (d) => ({
        ...d,
        nodes: d.nodes.map((n, i) => i === idx ? { ...n, label: value } : n),
      }));
    } else {
      const num = isNaN(Number(value)) ? value : Number(value);
      updateObjectData(objId, (d) => ({
        ...d,
        values: d.values.map((v, i) => i === idx ? num : v),
      }));
    }
    setEditCell(null);
  }, [editCell, objects, updateObjectData]);

  /* ── Render helpers ────────────────────────────────────────── */
  const sel = (id) => id === selectedId ? 'dsa-selected' : '';

  function renderArray(obj) {
    const { values } = obj.data;
    const w = values.length * CELL;
    return (
      <g key={obj.id} transform={`translate(${obj.x},${obj.y})`} onPointerDown={(e) => startDrag(e, obj.id)} className={`dsa-obj ${sel(obj.id)}`}>
        <text x={0} y={-10} className="dsa-type-label">Array</text>
        <rect x={0} y={0} width={w} height={CELL_H} rx={4} className="dsa-bg-rect" />
        {values.map((v, i) => (
          <g key={i}>
            <rect x={i * CELL} y={0} width={CELL} height={CELL_H} rx={2} className="dsa-cell" />
            <text x={i * CELL + CELL / 2} y={CELL_H / 2 + 1} className="dsa-val" onDoubleClick={(e) => { const r = e.target.getBoundingClientRect(); startEdit(obj.id, i, v, r.x, r.y); }}>{v}</text>
            <text x={i * CELL + CELL / 2} y={CELL_H + 14} className="dsa-idx">[{i}]</text>
          </g>
        ))}
        {selectedId === obj.id && <g className="dsa-actions" transform={`translate(${w + 6}, 0)`}>
          <rect x={0} y={0} width={22} height={CELL_H / 2 - 1} rx={3} className="dsa-add-btn" onClick={(e) => { e.stopPropagation(); updateObjectData(obj.id, d => ({ ...d, values: [...d.values, 0] })); }} />
          <text x={11} y={CELL_H / 4 + 1} className="dsa-add-label">+</text>
          {values.length > 1 && <>
            <rect x={0} y={CELL_H / 2 + 1} width={22} height={CELL_H / 2 - 1} rx={3} className="dsa-del-btn" onClick={(e) => { e.stopPropagation(); updateObjectData(obj.id, d => ({ ...d, values: d.values.slice(0, -1) })); }} />
            <text x={11} y={CELL_H * 3 / 4 + 1} className="dsa-del-label">−</text>
          </>}
        </g>}
      </g>
    );
  }

  function renderLinkedList(obj) {
    const { values, doubly } = obj.data;
    const nw = 52, gap = 30;
    return (
      <g key={obj.id} transform={`translate(${obj.x},${obj.y})`} onPointerDown={(e) => startDrag(e, obj.id)} className={`dsa-obj ${sel(obj.id)}`}>
        <text x={0} y={-10} className="dsa-type-label">{doubly ? 'Doubly' : 'Singly'} Linked List</text>
        {values.map((v, i) => {
          const nx = i * (nw + gap);
          return (
            <g key={i}>
              <rect x={nx} y={0} width={nw} height={CELL_H} rx={6} className="dsa-cell" />
              <text x={nx + nw / 2} y={CELL_H / 2 + 1} className="dsa-val" onDoubleClick={(e) => { const r = e.target.getBoundingClientRect(); startEdit(obj.id, i, v, r.x, r.y); }}>{v}</text>
              {i < values.length - 1 && <line x1={nx + nw} y1={CELL_H / 2} x2={nx + nw + gap} y2={CELL_H / 2} className="dsa-arrow" markerEnd="url(#ah)" />}
              {doubly && i > 0 && <line x1={nx} y1={CELL_H / 2 + 6} x2={nx - gap} y2={CELL_H / 2 + 6} className="dsa-arrow dsa-arrow--back" markerEnd="url(#ah)" />}
              {i === 0 && <text x={nx + nw / 2} y={CELL_H + 14} className="dsa-ptr">head</text>}
              {i === values.length - 1 && <text x={nx + nw / 2} y={CELL_H + 14} className="dsa-ptr">tail</text>}
            </g>
          );
        })}
        <text x={values.length * (nw + gap) - gap + 10} y={CELL_H / 2 + 4} className="dsa-null">null</text>
        {selectedId === obj.id && <g className="dsa-actions" transform={`translate(${values.length * (nw + gap) + 20}, 0)`}>
          <rect x={0} y={0} width={22} height={CELL_H / 2 - 1} rx={3} className="dsa-add-btn" onClick={(e) => { e.stopPropagation(); updateObjectData(obj.id, d => ({ ...d, values: [...d.values, 0] })); }} />
          <text x={11} y={CELL_H / 4 + 1} className="dsa-add-label">+</text>
          {values.length > 1 && <>
            <rect x={0} y={CELL_H / 2 + 1} width={22} height={CELL_H / 2 - 1} rx={3} className="dsa-del-btn" onClick={(e) => { e.stopPropagation(); updateObjectData(obj.id, d => ({ ...d, values: d.values.slice(0, -1) })); }} />
            <text x={11} y={CELL_H * 3 / 4 + 1} className="dsa-del-label">−</text>
          </>}
        </g>}
      </g>
    );
  }

  function renderStack(obj) {
    const { values } = obj.data;
    return (
      <g key={obj.id} transform={`translate(${obj.x},${obj.y})`} onPointerDown={(e) => startDrag(e, obj.id)} className={`dsa-obj ${sel(obj.id)}`}>
        <text x={CELL / 2} y={-10} className="dsa-type-label">Stack</text>
        {[...values].reverse().map((v, i) => (
          <g key={i}>
            <rect x={0} y={i * CELL_H} width={CELL * 1.5} height={CELL_H} rx={3} className="dsa-cell" />
            <text x={CELL * 0.75} y={i * CELL_H + CELL_H / 2 + 1} className="dsa-val" onDoubleClick={(e) => { const r = e.target.getBoundingClientRect(); startEdit(obj.id, values.length - 1 - i, v, r.x, r.y); }}>{v}</text>
            {i === 0 && <text x={CELL * 1.5 + 8} y={i * CELL_H + CELL_H / 2 + 1} className="dsa-ptr">← top</text>}
          </g>
        ))}
        {selectedId === obj.id && <g className="dsa-actions" transform={`translate(${CELL * 1.5 + 6}, ${values.length * CELL_H - CELL_H})`}>
          <rect x={0} y={0} width={22} height={CELL_H / 2 - 1} rx={3} className="dsa-add-btn" onClick={(e) => { e.stopPropagation(); updateObjectData(obj.id, d => ({ ...d, values: [...d.values, 0] })); }} />
          <text x={11} y={CELL_H / 4 + 1} className="dsa-add-label">+</text>
          {values.length > 1 && <>
            <rect x={0} y={CELL_H / 2 + 1} width={22} height={CELL_H / 2 - 1} rx={3} className="dsa-del-btn" onClick={(e) => { e.stopPropagation(); updateObjectData(obj.id, d => ({ ...d, values: d.values.slice(0, -1) })); }} />
            <text x={11} y={CELL_H * 3 / 4 + 1} className="dsa-del-label">−</text>
          </>}
        </g>}
      </g>
    );
  }

  function renderQueue(obj) {
    const { values } = obj.data;
    return (
      <g key={obj.id} transform={`translate(${obj.x},${obj.y})`} onPointerDown={(e) => startDrag(e, obj.id)} className={`dsa-obj ${sel(obj.id)}`}>
        <text x={0} y={-10} className="dsa-type-label">Queue</text>
        {values.map((v, i) => (
          <g key={i}>
            <rect x={i * CELL} y={0} width={CELL} height={CELL_H} rx={3} className="dsa-cell" />
            <text x={i * CELL + CELL / 2} y={CELL_H / 2 + 1} className="dsa-val" onDoubleClick={(e) => { const r = e.target.getBoundingClientRect(); startEdit(obj.id, i, v, r.x, r.y); }}>{v}</text>
          </g>
        ))}
        <text x={CELL / 2} y={CELL_H + 14} className="dsa-ptr">front</text>
        <text x={(values.length - 1) * CELL + CELL / 2} y={CELL_H + 14} className="dsa-ptr">rear</text>
        {selectedId === obj.id && <g className="dsa-actions" transform={`translate(${values.length * CELL + 6}, 0)`}>
          <rect x={0} y={0} width={22} height={CELL_H / 2 - 1} rx={3} className="dsa-add-btn" onClick={(e) => { e.stopPropagation(); updateObjectData(obj.id, d => ({ ...d, values: [...d.values, 0] })); }} />
          <text x={11} y={CELL_H / 4 + 1} className="dsa-add-label">+</text>
          {values.length > 1 && <>
            <rect x={0} y={CELL_H / 2 + 1} width={22} height={CELL_H / 2 - 1} rx={3} className="dsa-del-btn" onClick={(e) => { e.stopPropagation(); updateObjectData(obj.id, d => ({ ...d, values: d.values.slice(0, -1) })); }} />
            <text x={11} y={CELL_H * 3 / 4 + 1} className="dsa-del-label">−</text>
          </>}
        </g>}
      </g>
    );
  }

  function renderBST(obj) {
    const tree = buildBST(obj.data.values);
    const nodes = layoutBST(tree, 0, 0, 80);
    return (
      <g key={obj.id} transform={`translate(${obj.x},${obj.y})`} onPointerDown={(e) => startDrag(e, obj.id)} className={`dsa-obj ${sel(obj.id)}`}>
        <text x={0} y={-NODE_R - 6} className="dsa-type-label">Binary Search Tree</text>
        {nodes.map((n, i) => (
          <g key={i}>
            {n.left && <line x1={n.x} y1={n.y} x2={n.left.x} y2={n.left.y} className="dsa-edge" />}
            {n.right && <line x1={n.x} y1={n.y} x2={n.right.x} y2={n.right.y} className="dsa-edge" />}
          </g>
        ))}
        {nodes.map((n, i) => (
          <g key={`n${i}`}>
            <circle cx={n.x} cy={n.y} r={NODE_R} className="dsa-node" />
            <text x={n.x} y={n.y + 1} className="dsa-node-val" onDoubleClick={(e) => { const r = e.target.getBoundingClientRect(); startEdit(obj.id, i, n.val, r.x, r.y); }}>{n.val}</text>
          </g>
        ))}
        {selectedId === obj.id && <g className="dsa-actions" transform={`translate(${90}, ${-NODE_R - 6})`}>
          <rect x={0} y={0} width={22} height={18} rx={3} className="dsa-add-btn" onClick={(e) => { e.stopPropagation(); const v = Math.floor(Math.random() * 100); updateObjectData(obj.id, d => ({ ...d, values: [...d.values, v] })); }} />
          <text x={11} y={13} className="dsa-add-label">+</text>
          {obj.data.values.length > 1 && <>
            <rect x={26} y={0} width={22} height={18} rx={3} className="dsa-del-btn" onClick={(e) => { e.stopPropagation(); updateObjectData(obj.id, d => ({ ...d, values: d.values.slice(0, -1) })); }} />
            <text x={37} y={13} className="dsa-del-label">−</text>
          </>}
        </g>}
      </g>
    );
  }

  function renderGraph(obj) {
    const { nodes, edges } = obj.data;
    return (
      <g key={obj.id} transform={`translate(${obj.x},${obj.y})`} onPointerDown={(e) => startDrag(e, obj.id)} className={`dsa-obj ${sel(obj.id)}`}>
        <text x={0} y={-NODE_R - 6} className="dsa-type-label">Graph</text>
        {edges.map((ed, i) => {
          const from = nodes.find(n => n.id === ed.from);
          const to = nodes.find(n => n.id === ed.to);
          if (!from || !to) return null;
          return (
            <g key={i}>
              <line x1={from.rx} y1={from.ry} x2={to.rx} y2={to.ry} className="dsa-edge" markerEnd={ed.directed ? 'url(#ah)' : undefined} />
              {ed.weight && <text x={(from.rx + to.rx) / 2} y={(from.ry + to.ry) / 2 - 6} className="dsa-weight">{ed.weight}</text>}
            </g>
          );
        })}
        {nodes.map((n, i) => (
          <g key={n.id}>
            <circle cx={n.rx} cy={n.ry} r={NODE_R} className="dsa-node" />
            <text x={n.rx} y={n.ry + 1} className="dsa-node-val" onDoubleClick={(e) => { const r = e.target.getBoundingClientRect(); startEdit(obj.id, i, n.label, r.x, r.y); }}>{n.label}</text>
          </g>
        ))}
        {selectedId === obj.id && <g className="dsa-actions" transform={`translate(${130}, ${-NODE_R - 6})`}>
          <rect x={0} y={0} width={22} height={18} rx={3} className="dsa-add-btn" onClick={(e) => { e.stopPropagation(); updateObjectData(obj.id, d => { const id = `n${Date.now()}`; return { ...d, nodes: [...d.nodes, { id, label: String.fromCharCode(65 + d.nodes.length), rx: 60, ry: 50 + d.nodes.length * 30 }] }; }); }} />
          <text x={11} y={13} className="dsa-add-label">+</text>
        </g>}
      </g>
    );
  }

  function renderLabel(obj) {
    return (
      <g key={obj.id} transform={`translate(${obj.x},${obj.y})`} onPointerDown={(e) => startDrag(e, obj.id)} className={`dsa-obj ${sel(obj.id)}`}>
        <text x={0} y={0} className="dsa-label-text" style={{ fontSize: obj.data.fontSize }} onDoubleClick={(e) => { const r = e.target.getBoundingClientRect(); startEdit(obj.id, 0, obj.data.text, r.x, r.y); }}>{obj.data.text}</text>
      </g>
    );
  }

  function renderObject(obj) {
    switch (obj.type) {
      case 'array': return renderArray(obj);
      case 'linkedlist': return renderLinkedList(obj);
      case 'stack': return renderStack(obj);
      case 'queue': return renderQueue(obj);
      case 'bst': return renderBST(obj);
      case 'graph': return renderGraph(obj);
      case 'label': return renderLabel(obj);
      default: return null;
    }
  }

  return (
    <div className="dsa-container">
      {/* Toolbar */}
      <div className="dsa-toolbar">
        {DSA_TOOLS.map(t => (
          <button key={t.type} className={`dsa-tool-btn ${activeTool === t.type ? 'dsa-tool-btn--active' : ''}`} onClick={() => setActiveTool(activeTool === t.type ? null : t.type)} title={`Place ${t.label}`}>
            {t.label}
          </button>
        ))}
        <span className="dsa-tb-div" />
        <button className="dsa-tool-btn" onClick={undo} title="Undo (Ctrl+Z)">↩</button>
        <button className="dsa-tool-btn" onClick={redo} title="Redo (Ctrl+Y)">↪</button>
        {selectedId && <><span className="dsa-tb-div" /><button className="dsa-tool-btn dsa-tool-btn--danger" onClick={() => removeObject(selectedId)} title="Delete (Del)">✕ Delete</button></>}
        {activeTool && <span className="dsa-place-hint">Click on canvas to place {activeTool}</span>}
      </div>

      {/* SVG viewport */}
      <div className="dsa-viewport">
        <svg ref={svgRef} className="dsa-svg" onClick={onSvgClick} onPointerDown={onBgPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp} style={{ cursor: activeTool ? 'crosshair' : panning ? 'grabbing' : 'grab' }}>
          <defs>
            <marker id="ah" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
              <polygon points="0 0, 10 3.5, 0 7" fill="#58A6FF" />
            </marker>
          </defs>
          <g transform={`translate(${pan.x},${pan.y})`}>
            {objects.map(renderObject)}
          </g>
        </svg>

        {/* Floating inline editor */}
        {editCell && editPos && (
          <input className="dsa-inline-input" autoFocus style={{ left: editPos.x, top: editPos.y }} value={editCell.value} onChange={(e) => setEditCell({ ...editCell, value: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditCell(null); }} onBlur={commitEdit} />
        )}
      </div>
    </div>
  );
}
