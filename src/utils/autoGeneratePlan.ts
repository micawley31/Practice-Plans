import * as db from "../storage/db";
import { DRILL_CATEGORIES } from "../types";
import type { Drill, DrillCategory, DrillDifficulty, DrillSegment, PlanSegment } from "../types";

export interface AutoGenerateOptions {
  durationMinutes: number;
  /** Empty = no preference, draw from every category. */
  categories: DrillCategory[];
  difficulty: DrillDifficulty | "Any";
}

function pickRandom<T>(arr: T[]): T | undefined {
  return arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : undefined;
}

function toSegment(drill: Drill): DrillSegment {
  return {
    segmentId: db.makeId(),
    kind: "drill",
    tracks: [
      {
        trackId: db.makeId(),
        label: "Court 1",
        drillId: drill.id,
        duration: drill.duration,
        notes: "",
      },
    ],
  };
}

/**
 * Curates a practice plan by round-robin-picking drills across the chosen
 * (or all) categories until the target duration is used up, preferring
 * drills at the requested difficulty and falling back to any difficulty
 * when a category has none at that level. Warm-up drills are moved to the
 * front and Team & Scrimmage drills to the back afterward, since that's how
 * a real practice is structured, without complicating the selection loop
 * itself.
 */
export function generatePlanSegments(
  allDrills: Drill[],
  { durationMinutes, categories, difficulty }: AutoGenerateOptions
): PlanSegment[] {
  const poolCategories = categories.length > 0 ? categories : [...DRILL_CATEGORIES];
  const usedIds = new Set<string>();
  const picked: Drill[] = [];
  let remaining = durationMinutes;

  function candidatesFor(category: DrillCategory, requireDifficulty: boolean): Drill[] {
    return allDrills.filter(
      (d) =>
        d.category === category &&
        !usedIds.has(d.id) &&
        (!requireDifficulty || difficulty === "Any" || d.difficulty === difficulty)
    );
  }

  let cursor = 0;
  let stall = 0;
  let iterations = 0;
  const maxIterations = 40;

  while (remaining >= 5 && stall < poolCategories.length && iterations < maxIterations) {
    iterations++;
    const category = poolCategories[cursor % poolCategories.length];
    cursor++;

    let candidates = candidatesFor(category, true);
    if (candidates.length === 0) candidates = candidatesFor(category, false);
    const drill = pickRandom(candidates);

    if (drill && drill.duration <= remaining + 5) {
      usedIds.add(drill.id);
      picked.push(drill);
      remaining -= drill.duration;
      stall = 0;
    } else {
      stall++;
    }
  }

  const warmups = picked.filter((d) => d.category === "Warm-up");
  const scrimmages = picked.filter((d) => d.category === "Team & Scrimmage");
  const rest = picked.filter((d) => d.category !== "Warm-up" && d.category !== "Team & Scrimmage");

  return [...warmups, ...rest, ...scrimmages].map(toSegment);
}
