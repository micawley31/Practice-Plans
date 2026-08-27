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

export interface PlanDrill {
  planDrillId: string;
  drillId: string;
  duration: number;
  notes?: string;
}

export interface PracticePlan {
  id: string;
  name: string;
  date?: string;
  notes?: string;
  drills: PlanDrill[];
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export type PracticePlanInput = Omit<
  PracticePlan,
  "id" | "createdAt" | "updatedAt"
>;
