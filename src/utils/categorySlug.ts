import type { DrillCategory } from "../types";

/** "Passing & Receiving" -> "passing-receiving", for the badge-category-* CSS classes. */
export function categorySlug(category: DrillCategory): string {
  return category
    .toLowerCase()
    .replace(/\s*&\s*/g, "-")
    .replace(/\s+/g, "-");
}
