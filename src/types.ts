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

/** A player marker placed on a drill diagram. Coordinates are in the
 * diagram's own 0-100 x 0-50 unit space (see components/CourtDiagram.tsx),
 * not pixels, so the diagram scales cleanly at any display size. */
export interface DiagramPlayer {
  id: string;
  x: number;
  y: number;
  label: string;
}

/** A straight movement/ball-path arrow on a drill diagram, same unit space
 * as DiagramPlayer. */
export interface DiagramArrow {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** A hand-drawn court diagram for a drill: player positions + movement
 * arrows, stored as vector data (not an image) so it stays tiny in
 * localStorage and renders crisply at any size. */
export interface DrillDiagram {
  players: DiagramPlayer[];
  arrows: DiagramArrow[];
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
  /** A link to an external video (YouTube, Vimeo, etc.) demonstrating the drill. */
  videoUrl?: string;
  diagram?: DrillDiagram;
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
export interface DrillSegment {
  segmentId: string;
  kind: "drill";
  tracks: PlanTrack[];
}

/** A rest/water break block — a time slot with no drill attached. */
export interface BreakSegment {
  segmentId: string;
  kind: "break";
  label: string;
  duration: number;
}

export type PlanSegment = DrillSegment | BreakSegment;

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
