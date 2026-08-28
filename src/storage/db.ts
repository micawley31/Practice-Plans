import { supabase } from "../lib/supabaseClient";
import type {
  Drill,
  DrillComment,
  DrillInput,
  PlanSegment,
  PracticePlan,
  PracticePlanInput,
} from "../types";

export function makeId(): string {
  return crypto.randomUUID();
}

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Not signed in");
  return data.user.id;
}

function toEpochMs(iso: string): number {
  return new Date(iso).getTime();
}

function toIso(ms: number): string {
  return new Date(ms).toISOString();
}

// Segments saved with bad/missing `kind` (shouldn't happen via the app, but
// nothing at the DB layer enforces the shape) fall back to an empty drill
// segment rather than crashing the UI's switch(segment.kind).
function normalizeSegment(raw: any): PlanSegment {
  if (raw?.kind === "break") {
    return {
      segmentId: raw.segmentId,
      kind: "break",
      label: raw.label ?? "Break",
      duration: raw.duration ?? 5,
    };
  }
  return {
    segmentId: raw?.segmentId ?? makeId(),
    kind: "drill",
    tracks: raw?.tracks ?? [],
  };
}

interface DrillRow {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  description: string;
  tags: string[];
  duration: number;
  participants: string | null;
  equipment: string | null;
  video_url: string | null;
  diagram: unknown;
  created_at: string;
  updated_at: string;
  drill_ratings: { user_id: string; score: number }[] | null;
  drill_comments:
    | {
        id: string;
        text: string;
        created_at: string;
        profiles: { display_name: string } | null;
      }[]
    | null;
}

const DRILL_SELECT =
  "*, drill_ratings(user_id, score), drill_comments(id, text, created_at, profiles(display_name))";

function fromDrillRow(row: DrillRow): Drill {
  const ratings: Record<string, number> = {};
  (row.drill_ratings ?? []).forEach((r) => {
    ratings[r.user_id] = r.score;
  });
  const comments: DrillComment[] = (row.drill_comments ?? [])
    .map((c) => ({
      id: c.id,
      text: c.text,
      author: c.profiles?.display_name,
      createdAt: toEpochMs(c.created_at),
    }))
    .sort((a, b) => b.createdAt - a.createdAt);

  return {
    id: row.id,
    name: row.name,
    category: row.category as Drill["category"],
    difficulty: row.difficulty as Drill["difficulty"],
    description: row.description,
    tags: row.tags ?? [],
    duration: row.duration,
    participants: row.participants ?? undefined,
    equipment: row.equipment ?? undefined,
    videoUrl: row.video_url ?? undefined,
    diagram: (row.diagram as Drill["diagram"]) ?? undefined,
    ratings,
    comments,
    createdAt: toEpochMs(row.created_at),
    updatedAt: toEpochMs(row.updated_at),
  };
}

function toDrillColumns(input: DrillInput) {
  return {
    name: input.name,
    category: input.category,
    difficulty: input.difficulty,
    description: input.description,
    tags: input.tags,
    duration: input.duration,
    participants: input.participants ?? null,
    equipment: input.equipment ?? null,
    video_url: input.videoUrl ?? null,
    diagram: input.diagram ?? null,
  };
}

export async function getDrills(): Promise<Drill[]> {
  const { data, error } = await supabase.from("drills").select(DRILL_SELECT);
  if (error) throw error;
  return (data as unknown as DrillRow[])
    .map(fromDrillRow)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getDrill(id: string): Promise<Drill | undefined> {
  const { data, error } = await supabase.from("drills").select(DRILL_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? fromDrillRow(data as unknown as DrillRow) : undefined;
}

export async function addDrill(input: DrillInput): Promise<Drill> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("drills")
    .insert({ id: makeId(), ...toDrillColumns(input), created_by: userId })
    .select(DRILL_SELECT)
    .single();
  if (error) throw error;
  return fromDrillRow(data as unknown as DrillRow);
}

export async function updateDrill(id: string, input: DrillInput): Promise<Drill | undefined> {
  const { data, error } = await supabase
    .from("drills")
    .update({ ...toDrillColumns(input), updated_at: toIso(Date.now()) })
    .eq("id", id)
    .select(DRILL_SELECT)
    .maybeSingle();
  if (error) throw error;
  return data ? fromDrillRow(data as unknown as DrillRow) : undefined;
}

export async function deleteDrill(id: string): Promise<void> {
  const { error } = await supabase.from("drills").delete().eq("id", id);
  if (error) throw error;
}

export async function rateDrill(id: string, score: number): Promise<Drill | undefined> {
  const userId = await requireUserId();
  const { error } = await supabase
    .from("drill_ratings")
    .upsert({ drill_id: id, user_id: userId, score }, { onConflict: "drill_id,user_id" });
  if (error) throw error;
  return getDrill(id);
}

export async function addComment(drillId: string, text: string): Promise<Drill | undefined> {
  const userId = await requireUserId();
  const { error } = await supabase
    .from("drill_comments")
    .insert({ drill_id: drillId, user_id: userId, text });
  if (error) throw error;
  return getDrill(drillId);
}

export async function deleteComment(drillId: string, commentId: string): Promise<Drill | undefined> {
  const { error } = await supabase.from("drill_comments").delete().eq("id", commentId);
  if (error) throw error;
  return getDrill(drillId);
}

interface PlanRow {
  id: string;
  name: string;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  segments: unknown;
  favorite: boolean;
  created_at: string;
  updated_at: string;
}

function fromPlanRow(row: PlanRow): PracticePlan {
  const rawSegments = Array.isArray(row.segments) ? row.segments : [];
  return {
    id: row.id,
    name: row.name,
    date: row.date ?? undefined,
    startTime: row.start_time ?? undefined,
    endTime: row.end_time ?? undefined,
    notes: row.notes ?? undefined,
    segments: rawSegments.map(normalizeSegment),
    favorite: row.favorite,
    createdAt: toEpochMs(row.created_at),
    updatedAt: toEpochMs(row.updated_at),
  };
}

function toPlanColumns(input: PracticePlanInput) {
  return {
    name: input.name,
    date: input.date ?? null,
    start_time: input.startTime ?? null,
    end_time: input.endTime ?? null,
    notes: input.notes ?? null,
    segments: input.segments,
    favorite: input.favorite,
  };
}

export async function getPlans(): Promise<PracticePlan[]> {
  const { data, error } = await supabase.from("practice_plans").select("*");
  if (error) throw error;
  return (data as PlanRow[])
    .map(fromPlanRow)
    .sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.updatedAt - a.updatedAt);
}

export async function getPlan(id: string): Promise<PracticePlan | undefined> {
  const { data, error } = await supabase
    .from("practice_plans")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? fromPlanRow(data as PlanRow) : undefined;
}

export async function addPlan(input: PracticePlanInput): Promise<PracticePlan> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("practice_plans")
    .insert({ id: makeId(), user_id: userId, ...toPlanColumns(input) })
    .select("*")
    .single();
  if (error) throw error;
  return fromPlanRow(data as PlanRow);
}

export async function updatePlan(
  id: string,
  input: PracticePlanInput
): Promise<PracticePlan | undefined> {
  const { data, error } = await supabase
    .from("practice_plans")
    .update({ ...toPlanColumns(input), updated_at: toIso(Date.now()) })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? fromPlanRow(data as PlanRow) : undefined;
}

export async function deletePlan(id: string): Promise<void> {
  const { error } = await supabase.from("practice_plans").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleFavoritePlan(id: string): Promise<PracticePlan | undefined> {
  const existing = await getPlan(id);
  if (!existing) return undefined;
  const { data, error } = await supabase
    .from("practice_plans")
    .update({ favorite: !existing.favorite, updated_at: toIso(Date.now()) })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? fromPlanRow(data as PlanRow) : undefined;
}
