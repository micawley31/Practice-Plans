import { useState } from "react";
import { DIFFICULTY_LEVELS, DRILL_CATEGORIES, type DrillCategory, type DrillDifficulty } from "../types";
import { ChipFilter } from "./ChipFilter";
import { ChevronDownIcon, ChevronUpIcon, XIcon } from "./icons";
import { RatingFilter } from "./RatingFilter";

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
  categories: Set<DrillCategory>;
  onToggleCategory: (category: DrillCategory) => void;
  onClearCategories: () => void;
  difficulties: Set<DrillDifficulty>;
  onToggleDifficulty: (difficulty: DrillDifficulty) => void;
  onClearDifficulties: () => void;
  minRating: number;
  onMinRatingChange: (value: number) => void;
}

export function DrillFilterBar(props: Props) {
  const [expanded, setExpanded] = useState(false);
  const activeCount = props.categories.size + props.difficulties.size + (props.minRating > 0 ? 1 : 0);

  function clearAll() {
    props.onClearCategories();
    props.onClearDifficulties();
    props.onMinRatingChange(0);
  }

  return (
    <div className="drill-filter-bar">
      <div className="search-input-wrapper">
        <input
          className="search-input"
          type="search"
          placeholder="Search by name, description, or keyword…"
          value={props.query}
          onChange={(e) => props.onQueryChange(e.target.value)}
        />
        {props.query && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => props.onQueryChange("")}
            aria-label="Clear search"
          >
            <XIcon />
          </button>
        )}
      </div>

      <div className="filter-toggle-row">
        <button
          type="button"
          className="filter-toggle-btn"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          Filters
          {activeCount > 0 && <span className="filter-badge-count">{activeCount}</span>}
          <span className="filter-toggle-chevron">
            {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </span>
        </button>
        {activeCount > 0 && (
          <button type="button" className="filter-clear-all" onClick={clearAll}>
            Clear filters
          </button>
        )}
      </div>

      {expanded && (
        <div className="filter-panel">
          <ChipFilter
            label="Category"
            options={DRILL_CATEGORIES}
            selected={props.categories}
            onToggle={props.onToggleCategory}
            onClear={props.onClearCategories}
          />
          <ChipFilter
            label="Difficulty"
            options={DIFFICULTY_LEVELS}
            selected={props.difficulties}
            onToggle={props.onToggleDifficulty}
            onClear={props.onClearDifficulties}
          />
          <RatingFilter value={props.minRating} onChange={props.onMinRatingChange} />
        </div>
      )}
    </div>
  );
}
