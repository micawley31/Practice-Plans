export const DRILL_CATEGORIES = [
  "Warm-up",
  "Serving",
  "Passing & Receiving",
  "Setting",
  "Attacking",
  "Blocking",
  "Defense & Digging",
  "Ball Control",
  "Conditioning",
  "Team & Scrimmage",
] as const;

export type DrillCategory = (typeof DRILL_CATEGORIES)[number];

export const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export type DrillDifficulty = (typeof DIFFICULTY_LEVELS)[number];

export interface DrillComment {
  id: string;
  text: string;
  author?: string;
  createdAt: number;
}

export interface Profile {
  id: string;
  name: string;
  createdAt: number;
}

export interface Drill {
  id: string;
  name: string;
  category: DrillCategory;
  difficulty: DrillDifficulty;
  description: string;
  tags: string[];
  duration: number;
  participants?: string;
  equipment?: string;
  /** Maps an anonymous per-device rater id to their 1-5 star rating. */
  ratings: Record<string, number>;
  comments: DrillComment[];
  createdAt: number;
  updatedAt: number;
}

export type DrillInput = Omit<
  Drill,
  "id" | "createdAt" | "updatedAt" | "ratings" | "comments"
>;

/** One drill running on one court/station within a time block. */
export interface PlanTrack {
  trackId: string;
  label: string;
  drillId: string;
  duration: number;
  notes?: string;
}

/**
 * A slice of the schedule. Every track in a segment runs at the same time —
 * multiple tracks means multiple courts running different drills in
 * parallel — and the segment's length is the longest of its tracks, since
 * the whole team regroups once every court is done.
 */
export interface PlanSegment {
  segmentId: string;
  tracks: PlanTrack[];
}

export interface PracticePlan {
  id: string;
  name: string;
  date?: string;
  /** 24h "HH:MM", from an <input type="time">. */
  startTime?: string;
  endTime?: string;
  notes?: string;
  segments: PlanSegment[];
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export type PracticePlanInput = Omit<
  PracticePlan,
  "id" | "createdAt" | "updatedAt"
>;
