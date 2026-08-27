import { DRILL_CATEGORIES, type DrillCategory } from "../types";

interface Props {
  selected: Set<DrillCategory>;
  onToggle: (category: DrillCategory) => void;
  onClear: () => void;
}

export function CategoryFilter({ selected, onToggle, onClear }: Props) {
  return (
    <div className="category-filter">
      <button
        type="button"
        className={selected.size === 0 ? "chip chip-active" : "chip"}
        onClick={onClear}
      >
        All
      </button>
      {DRILL_CATEGORIES.map((category) => (
        <button
          type="button"
          key={category}
          className={selected.has(category) ? "chip chip-active" : "chip"}
          onClick={() => onToggle(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
