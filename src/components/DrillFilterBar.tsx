import { DIFFICULTY_LEVELS, DRILL_CATEGORIES, type DrillCategory, type DrillDifficulty } from "../types";
import { ChipFilter } from "./ChipFilter";
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
  return (
    <div className="drill-filter-bar">
      <input
        className="search-input"
        type="search"
        placeholder="Search by name, description, or keyword…"
        value={props.query}
        onChange={(e) => props.onQueryChange(e.target.value)}
      />
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
  );
}
