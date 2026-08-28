import { useRef, useState, type PointerEvent } from "react";
import type { DrillDiagram } from "../types";
import { UndoIcon } from "./icons";
import { Modal } from "./Modal";

interface Props {
  initial?: DrillDiagram;
  onSave: (diagram: DrillDiagram) => void;
  onClose: () => void;
}

type Tool = "player" | "arrow" | "eraser";
type DraftArrow = { x1: number; y1: number; x2: number; y2: number };

function emptyDiagram(): DrillDiagram {
  return { players: [], arrows: [] };
}

export function DiagramEditor({ initial, onSave, onClose }: Props) {
  const [diagram, setDiagram] = useState<DrillDiagram>(initial ?? emptyDiagram());
  const [history, setHistory] = useState<DrillDiagram[]>([]);
  const [tool, setTool] = useState<Tool>("player");
  const [draftArrow, setDraftArrow] = useState<DraftArrow | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingId = useRef<string | null>(null);
  const arrowStart = useRef<{ x: number; y: number } | null>(null);

  function commit(next: DrillDiagram) {
    setHistory((h) => [...h, diagram]);
    setDiagram(next);
  }

  function undo() {
    setHistory((h) => {
      if (h.length === 0) return h;
      setDiagram(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }

  function pointFromEvent(e: { clientX: number; clientY: number }): { x: number; y: number } {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const loc = pt.matrixTransform(ctm.inverse());
    return { x: loc.x, y: loc.y };
  }

  function handleBackgroundPointerDown(e: PointerEvent<SVGSVGElement>) {
    const p = pointFromEvent(e);
    if (tool === "player") {
      commit({
        ...diagram,
        players: [
          ...diagram.players,
          { id: crypto.randomUUID(), x: p.x, y: p.y, label: String(diagram.players.length + 1) },
        ],
      });
    } else if (tool === "arrow") {
      arrowStart.current = p;
      setDraftArrow({ x1: p.x, y1: p.y, x2: p.x, y2: p.y });
    }
  }

  function handlePointerMove(e: PointerEvent<SVGSVGElement>) {
    const p = pointFromEvent(e);
    if (draggingId.current) {
      const id = draggingId.current;
      setDiagram((d) => ({
        ...d,
        players: d.players.map((pl) => (pl.id === id ? { ...pl, x: p.x, y: p.y } : pl)),
      }));
    } else if (arrowStart.current) {
      setDraftArrow({ x1: arrowStart.current.x, y1: arrowStart.current.y, x2: p.x, y2: p.y });
    }
  }

  function handlePointerUp() {
    if (draggingId.current) {
      draggingId.current = null;
    } else if (arrowStart.current && draftArrow) {
      const dist = Math.hypot(draftArrow.x2 - draftArrow.x1, draftArrow.y2 - draftArrow.y1);
      if (dist > 2) {
        commit({ ...diagram, arrows: [...diagram.arrows, { id: crypto.randomUUID(), ...draftArrow }] });
      }
      arrowStart.current = null;
      setDraftArrow(null);
    }
  }

  function handlePlayerPointerDown(id: string, e: PointerEvent) {
    e.stopPropagation();
    if (tool === "eraser") {
      commit({ ...diagram, players: diagram.players.filter((p) => p.id !== id) });
      return;
    }
    if (tool === "player") {
      draggingId.current = id;
    }
  }

  function handleArrowPointerDown(id: string, e: PointerEvent) {
    e.stopPropagation();
    if (tool === "eraser") {
      commit({ ...diagram, arrows: diagram.arrows.filter((a) => a.id !== id) });
    }
  }

  function clearAll() {
    commit(emptyDiagram());
  }

  const isEmpty = diagram.players.length === 0 && diagram.arrows.length === 0;

  return (
    <Modal title="Edit Diagram" onClose={onClose}>
      <div className="diagram-toolbar">
        <div className="chip-row">
          <button
            type="button"
            className={tool === "player" ? "chip chip-active" : "chip"}
            onClick={() => setTool("player")}
          >
            Player
          </button>
          <button
            type="button"
            className={tool === "arrow" ? "chip chip-active" : "chip"}
            onClick={() => setTool("arrow")}
          >
            Arrow
          </button>
          <button
            type="button"
            className={tool === "eraser" ? "chip chip-active" : "chip"}
            onClick={() => setTool("eraser")}
          >
            Eraser
          </button>
        </div>
        <div className="diagram-toolbar-actions">
          <button
            type="button"
            className="btn-icon"
            onClick={undo}
            disabled={history.length === 0}
            aria-label="Undo"
            title="Undo"
          >
            <UndoIcon />
          </button>
          <button
            type="button"
            className="btn-text btn-sm"
            onClick={clearAll}
            disabled={isEmpty}
          >
            Clear all
          </button>
        </div>
      </div>

      <p className="empty-state-inline">
        {tool === "player" && "Click the court to place a player. Drag a player to move it."}
        {tool === "arrow" && "Drag on the court to draw a movement arrow."}
        {tool === "eraser" && "Click a player or arrow to remove it."}
      </p>

      <svg
        ref={svgRef}
        viewBox="0 0 100 50"
        className="court-diagram diagram-canvas"
        onPointerDown={handleBackgroundPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <defs>
          <marker
            id="diagram-editor-arrowhead"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 Z" className="court-diagram-arrowhead-fill" />
          </marker>
        </defs>
        <rect x={5} y={5} width={90} height={40} className="court-diagram-boundary" />
        <line x1={50} y1={5} x2={50} y2={45} className="court-diagram-net" />
        <line x1={34} y1={5} x2={34} y2={45} className="court-diagram-attack-line" />
        <line x1={66} y1={5} x2={66} y2={45} className="court-diagram-attack-line" />

        {diagram.arrows.map((a) => (
          <g key={a.id}>
            <line
              x1={a.x1}
              y1={a.y1}
              x2={a.x2}
              y2={a.y2}
              className="court-diagram-arrow-hit"
              onPointerDown={(e) => handleArrowPointerDown(a.id, e)}
            />
            <line
              x1={a.x1}
              y1={a.y1}
              x2={a.x2}
              y2={a.y2}
              className="court-diagram-arrow"
              markerEnd="url(#diagram-editor-arrowhead)"
            />
          </g>
        ))}
        {draftArrow && (
          <line
            x1={draftArrow.x1}
            y1={draftArrow.y1}
            x2={draftArrow.x2}
            y2={draftArrow.y2}
            className="court-diagram-arrow court-diagram-arrow-draft"
          />
        )}

        {diagram.players.map((p) => (
          <g
            key={p.id}
            transform={`translate(${p.x} ${p.y})`}
            onPointerDown={(e) => handlePlayerPointerDown(p.id, e)}
            className="court-diagram-player-group"
          >
            <circle r={3.2} className="court-diagram-player" />
            <text className="court-diagram-player-label" textAnchor="middle" dy="1.2">
              {p.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="form-actions">
        <button type="button" className="btn-text" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={() => onSave(diagram)}>
          Save Diagram
        </button>
      </div>
    </Modal>
  );
}
