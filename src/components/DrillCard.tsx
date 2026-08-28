import type { Drill } from "../types";
import { categorySlug } from "../utils/categorySlug";
import { getAverageRating } from "../utils/rating";
import { CheckIcon, ClockIcon, UsersIcon } from "./icons";
import { StarRating } from "./StarRating";

interface Props {
  drill: Drill;
  onClick: () => void;
  action?: { label: string; onClick: (drill: Drill) => void };
  added?: boolean;
}

export function DrillCard({ drill, onClick, action, added }: Props) {
  const { average, count } = getAverageRating(drill);

  return (
    <div className="drill-card">
      <button type="button" className="drill-card-main" onClick={onClick}>
        <div className="drill-card-header">
          <span className="drill-card-name">{drill.name}</span>
          <div className="badge-group">
            {added && (
              <span className="badge badge-in-plan icon-label">
                <CheckIcon /> In plan
              </span>
            )}
            <span className={`badge badge-category-${categorySlug(drill.category)}`}>
              {drill.category}
            </span>
            <span className={`badge badge-difficulty badge-${drill.difficulty.toLowerCase()}`}>
              {drill.difficulty}
            </span>
          </div>
        </div>
        <StarRating average={average} count={count} size="sm" />
        <p className="drill-card-description">{drill.description}</p>
        <div className="drill-card-meta">
          <span className="icon-label">
            <ClockIcon /> {drill.duration} min
          </span>
          {drill.participants && (
            <span className="icon-label">
              <UsersIcon /> {drill.participants}
            </span>
          )}
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
