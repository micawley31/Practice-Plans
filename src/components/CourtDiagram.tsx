import type { DrillDiagram } from "../types";

interface Props {
  diagram: DrillDiagram;
  className?: string;
}

/** Read-only rendering of a drill diagram: a simplified top-down court
 * (boundary, net, attack lines) with player markers and movement arrows
 * drawn on top. Coordinates are in the diagram's own 0-100 x 0-50 unit
 * space, independent of pixel size, so it scales cleanly at any width. */
export function CourtDiagram({ diagram, className }: Props) {
  return (
    <svg
      viewBox="0 0 100 50"
      className={className ? `court-diagram ${className}` : "court-diagram"}
    >
      <defs>
        <marker
          id="court-diagram-arrowhead"
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
        <line
          key={a.id}
          x1={a.x1}
          y1={a.y1}
          x2={a.x2}
          y2={a.y2}
          className="court-diagram-arrow"
          markerEnd="url(#court-diagram-arrowhead)"
        />
      ))}
      {diagram.players.map((p) => (
        <g key={p.id} transform={`translate(${p.x} ${p.y})`}>
          <circle r={3.2} className="court-diagram-player" />
          <text className="court-diagram-player-label" textAnchor="middle" dy="1.2">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
