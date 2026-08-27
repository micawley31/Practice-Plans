import type { Drill } from "../types";
import { Modal } from "./Modal";

interface Props {
  drill: Drill;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  action?: { label: string; onClick: (drill: Drill) => void };
}

export function DrillDetailModal({ drill, onClose, onEdit, onDelete, action }: Props) {
  return (
    <Modal title={drill.name} onClose={onClose}>
      <div className="drill-detail">
        <span className="badge">{drill.category}</span>
        <p className="drill-detail-description">{drill.description}</p>
        <dl className="drill-detail-meta">
          <div>
            <dt>Duration</dt>
            <dd>{drill.duration} min</dd>
          </div>
          {drill.participants && (
            <div>
              <dt>Participants</dt>
              <dd>{drill.participants}</dd>
            </div>
          )}
          {drill.equipment && (
            <div>
              <dt>Equipment</dt>
              <dd>{drill.equipment}</dd>
            </div>
          )}
        </dl>
        {drill.tags.length > 0 && (
          <div className="tag-list">
            {drill.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="form-actions">
          <button type="button" className="btn btn-danger" onClick={onDelete}>
            Delete
          </button>
          <button type="button" className="btn" onClick={onEdit}>
            Edit
          </button>
          {action && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => action.onClick(drill)}
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
