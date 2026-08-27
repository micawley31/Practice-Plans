import type { Drill, DrillCategory, DrillDifficulty } from "../types";
import { getAverageRating } from "./rating";

export function filterDrills(
  drills: Drill[],
  query: string,
  categories: Set<DrillCategory>,
  difficulties: Set<DrillDifficulty>,
  minRating: number
): Drill[] {
  const q = query.trim().toLowerCase();
  return drills.filter((drill) => {
    if (categories.size > 0 && !categories.has(drill.category)) return false;
    if (difficulties.size > 0 && !difficulties.has(drill.difficulty)) return false;
    if (minRating > 0 && getAverageRating(drill).average < minRating) return false;
    if (!q) return true;
    const haystack = [
      drill.name,
      drill.description,
      drill.category,
      drill.difficulty,
      ...drill.tags,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
