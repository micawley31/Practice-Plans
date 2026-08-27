import type { Drill } from "../types";

interface Props {
  drill: Drill;
  onClick: () => void;
  action?: { label: string; onClick: (drill: Drill) => void };
}

export function DrillCard({ drill, onClick, action }: Props) {
  return (
    <div className="drill-card">
      <button type="button" className="drill-card-main" onClick={onClick}>
        <div className="drill-card-header">
          <span className="drill-card-name">{drill.name}</span>
          <span className="badge">{drill.category}</span>
        </div>
        <p className="drill-card-description">{drill.description}</p>
        <div className="drill-card-meta">
          <span>⏱ {drill.duration} min</span>
          {drill.participants && <span>👥 {drill.participants}</span>}
        </div>
        {drill.tags.length > 0 && (
          <div className="tag-list">
            {drill.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </button>
      {action && (
        <button
          type="button"
          className="btn btn-primary drill-card-action"
          onClick={() => action.onClick(drill)}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
