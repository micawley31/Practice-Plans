import type { Drill, DrillCategory } from "../types";

export function filterDrills(
  drills: Drill[],
  query: string,
  categories: Set<DrillCategory>
): Drill[] {
  const q = query.trim().toLowerCase();
  return drills.filter((drill) => {
    if (categories.size > 0 && !categories.has(drill.category)) return false;
    if (!q) return true;
    const haystack = [drill.name, drill.description, drill.category, ...drill.tags]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
