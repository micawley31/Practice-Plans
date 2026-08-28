import { useActiveProfile } from "../contexts/ActiveProfileContext";
import type { Drill } from "../types";
import { categorySlug } from "../utils/categorySlug";
import { getAverageRating, getMyRating } from "../utils/rating";
import { DrillComments } from "./DrillComments";
import { DrillMedia } from "./DrillMedia";
import { Modal } from "./Modal";
import { StarRating } from "./StarRating";

interface Props {
  drill: Drill;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRate: (score: number) => void;
  onAddComment: (text: string) => void;
  onDeleteComment: (commentId: string) => void;
  action?: { label: string; onClick: (drill: Drill) => void };
}

export function DrillDetailModal({
  drill,
  onClose,
  onEdit,
  onDelete,
  onRate,
  onAddComment,
  onDeleteComment,
  action,
}: Props) {
  const { activeProfile } = useActiveProfile();
  const { average, count } = getAverageRating(drill);
  const myRating = activeProfile ? getMyRating(drill, activeProfile.id) : undefined;

  return (
    <Modal title={drill.name} onClose={onClose}>
      <div className="drill-detail">
        <div className="badge-group">
          <span className={`badge badge-category-${categorySlug(drill.category)}`}>
            {drill.category}
          </span>
          <span className={`badge badge-difficulty badge-${drill.difficulty.toLowerCase()}`}>
            {drill.difficulty}
          </span>
        </div>
        <StarRating average={average} count={count} myRating={myRating} onRate={onRate} />
        <p className="drill-detail-description">{drill.description}</p>
        <DrillMedia drill={drill} />
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
          <button type="button" className="btn btn-danger push-right" onClick={onDelete}>
            Delete
          </button>
        </div>
        <hr className="divider" />
        <DrillComments
          comments={drill.comments}
          onAdd={onAddComment}
          onDelete={onDeleteComment}
        />
      </div>
    </Modal>
  );
}
