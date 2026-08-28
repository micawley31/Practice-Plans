import { StarIcon } from "./icons";

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function RatingFilter({ value, onChange }: Props) {
  return (
    <div className="filter-group">
      <span className="filter-group-label">Minimum rating</span>
      <div className="chip-row">
        <button
          type="button"
          className={value === 0 ? "chip chip-active" : "chip"}
          onClick={() => onChange(0)}
        >
          Any
        </button>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            className={value === n ? "chip chip-active" : "chip"}
            onClick={() => onChange(n)}
          >
            <span className="icon-label">
              {n}
              <StarIcon />+
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
