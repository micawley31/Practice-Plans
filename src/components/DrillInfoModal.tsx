import type { Drill } from "../types";
import { categorySlug } from "../utils/categorySlug";
import { getAverageRating } from "../utils/rating";
import { DrillMedia } from "./DrillMedia";
import { Modal } from "./Modal";
import { StarRating } from "./StarRating";

interface Props {
  drill: Drill;
  onClose: () => void;
}

export function DrillInfoModal({ drill, onClose }: Props) {
  const { average, count } = getAverageRating(drill);

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
        <StarRating average={average} count={count} size="sm" />
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
      </div>
    </Modal>
  );
}
