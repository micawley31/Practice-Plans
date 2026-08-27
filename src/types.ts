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

export interface Drill {
  id: string;
  name: string;
  category: DrillCategory;
  description: string;
  tags: string[];
  duration: number;
  participants?: string;
  equipment?: string;
  createdAt: number;
  updatedAt: number;
}

export type DrillInput = Omit<Drill, "id" | "createdAt" | "updatedAt">;

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
  createdAt: number;
  updatedAt: number;
}

export type PracticePlanInput = Omit<
  PracticePlan,
  "id" | "createdAt" | "updatedAt"
>;
