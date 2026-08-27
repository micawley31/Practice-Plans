import type { Drill } from "../types";

export function getAverageRating(drill: Drill): { average: number; count: number } {
  const values = Object.values(drill.ratings ?? {});
  if (values.length === 0) return { average: 0, count: 0 };
  const sum = values.reduce((a, b) => a + b, 0);
  return { average: sum / values.length, count: values.length };
}

export function getMyRating(drill: Drill, raterId: string): number | undefined {
  return drill.ratings?.[raterId];
}
