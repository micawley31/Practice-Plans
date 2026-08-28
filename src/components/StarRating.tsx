import { useState } from "react";
import { StarIcon } from "./icons";

interface Props {
  average: number;
  count: number;
  myRating?: number;
  onRate?: (score: number) => void;
  size?: "sm" | "md";
}

export function StarRating({ average, count, myRating, onRate, size = "md" }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const interactive = Boolean(onRate);
  const displayValue = interactive ? hover ?? myRating ?? 0 : Math.round(average);

  return (
    <div className={`star-rating star-rating-${size}`}>
      <div
        className="star-row"
        onMouseLeave={() => setHover(null)}
        role={interactive ? "radiogroup" : undefined}
        aria-label={interactive ? "Rate this drill" : undefined}
      >
        {[1, 2, 3, 4, 5].map((n) =>
          interactive ? (
            <button
              type="button"
              key={n}
              className={n <= displayValue ? "star star-filled" : "star"}
              onMouseEnter={() => setHover(n)}
              onClick={() => onRate?.(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
            >
              <StarIcon />
            </button>
          ) : (
            <span key={n} className={n <= displayValue ? "star star-filled" : "star"}>
              <StarIcon />
            </span>
          )
        )}
      </div>
      <span className="star-rating-summary">
        {count > 0 ? `${average.toFixed(1)} (${count})` : "No ratings yet"}
      </span>
    </div>
  );
}
