import { seedDrills } from "../data/seedDrills";
import type {
  Drill,
  DrillComment,
  DrillInput,
  PracticePlan,
  PracticePlanInput,
  Profile,
} from "../types";

const DRILLS_KEY = "practice-plans:drills";
const PLANS_KEY = "practice-plans:plans";
const PROFILES_KEY = "practice-plans:profiles";
const ACTIVE_PROFILE_KEY = "practice-plans:activeProfileId";

function makeId(): string {
  return crypto.randomUUID();
}

function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Backfills fields added after a user's data was first created, so older
// localStorage payloads keep working without a migration step.
function normalizeDrill(d: Drill): Drill {
  return {
    ...d,
    difficulty: d.difficulty ?? "Beginner",
    ratings: d.ratings ?? {},
    comments: d.comments ?? [],
  };
}

function normalizePlan(p: PracticePlan): PracticePlan {
  return { ...p, favorite: p.favorite ?? false };
}

function ensureSeeded(): void {
  if (localStorage.getItem(DRILLS_KEY)) return;
  const now = Date.now();
  const drills: Drill[] = seedDrills.map((d) => ({
    ...d,
    id: makeId(),
    ratings: {},
    comments: [],
    createdAt: now,
    updatedAt: now,
  }));
  writeJson(DRILLS_KEY, drills);
}

export function getDrills(): Drill[] {
  ensureSeeded();
  return readJson<Drill[]>(DRILLS_KEY, [])
    .map(normalizeDrill)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getDrill(id: string): Drill | undefined {
  return getDrills().find((d) => d.id === id);
}

export function addDrill(input: DrillInput): Drill {
  const now = Date.now();
  const drill: Drill = {
    ...input,
    id: makeId(),
    ratings: {},
    comments: [],
    createdAt: now,
    updatedAt: now,
  };
  const drills = getDrills();
  drills.push(drill);
  writeJson(DRILLS_KEY, drills);
  return drill;
}

export function updateDrill(id: string, input: DrillInput): Drill | undefined {
  const drills = getDrills();
  const idx = drills.findIndex((d) => d.id === id);
  if (idx === -1) return undefined;
  const updated: Drill = { ...drills[idx], ...input, updatedAt: Date.now() };
  drills[idx] = updated;
  writeJson(DRILLS_KEY, drills);
  return updated;
}

export function deleteDrill(id: string): void {
  const drills = getDrills().filter((d) => d.id !== id);
  writeJson(DRILLS_KEY, drills);

  const plans = getPlans().map((p) => ({
    ...p,
    drills: p.drills.filter((pd) => pd.drillId !== id),
  }));
  writeJson(PLANS_KEY, plans);
}

// No backend/auth yet: "accounts" are local profiles a person names
// themselves, switchable from the navbar and stashed in localStorage.
// Ratings key off the active profile's id; comments snapshot its name.
function ensureProfile(): void {
  if (localStorage.getItem(PROFILES_KEY)) return;
  const profile: Profile = { id: makeId(), name: "Coach 1", createdAt: Date.now() };
  writeJson(PROFILES_KEY, [profile]);
  localStorage.setItem(ACTIVE_PROFILE_KEY, profile.id);
}

export function getProfiles(): Profile[] {
  ensureProfile();
  return readJson<Profile[]>(PROFILES_KEY, []);
}

export function getActiveProfile(): Profile {
  const profiles = getProfiles();
  const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY);
  return profiles.find((p) => p.id === activeId) ?? profiles[0];
}

export function setActiveProfile(id: string): void {
  localStorage.setItem(ACTIVE_PROFILE_KEY, id);
}

export function createProfile(name: string): Profile {
  const profile: Profile = { id: makeId(), name, createdAt: Date.now() };
  const profiles = getProfiles();
  profiles.push(profile);
  writeJson(PROFILES_KEY, profiles);
  setActiveProfile(profile.id);
  return profile;
}

export function renameProfile(id: string, name: string): void {
  const profiles = getProfiles().map((p) => (p.id === id ? { ...p, name } : p));
  writeJson(PROFILES_KEY, profiles);
}

export function rateDrill(id: string, score: number): Drill | undefined {
  const drills = getDrills();
  const idx = drills.findIndex((d) => d.id === id);
  if (idx === -1) return undefined;
  const updated: Drill = {
    ...drills[idx],
    ratings: { ...drills[idx].ratings, [getActiveProfile().id]: score },
    updatedAt: Date.now(),
  };
  drills[idx] = updated;
  writeJson(DRILLS_KEY, drills);
  return updated;
}

export function addComment(drillId: string, text: string): Drill | undefined {
  const drills = getDrills();
  const idx = drills.findIndex((d) => d.id === drillId);
  if (idx === -1) return undefined;
  const comment: DrillComment = {
    id: makeId(),
    text,
    author: getActiveProfile().name,
    createdAt: Date.now(),
  };
  const updated: Drill = { ...drills[idx], comments: [...drills[idx].comments, comment] };
  drills[idx] = updated;
  writeJson(DRILLS_KEY, drills);
  return updated;
}

export function deleteComment(drillId: string, commentId: string): Drill | undefined {
  const drills = getDrills();
  const idx = drills.findIndex((d) => d.id === drillId);
  if (idx === -1) return undefined;
  const updated: Drill = {
    ...drills[idx],
    comments: drills[idx].comments.filter((c) => c.id !== commentId),
  };
  drills[idx] = updated;
  writeJson(DRILLS_KEY, drills);
  return updated;
}

export function getPlans(): PracticePlan[] {
  return readJson<PracticePlan[]>(PLANS_KEY, [])
    .map(normalizePlan)
    .sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.updatedAt - a.updatedAt);
}

export function getPlan(id: string): PracticePlan | undefined {
  return getPlans().find((p) => p.id === id);
}

export function addPlan(input: PracticePlanInput): PracticePlan {
  const now = Date.now();
  const plan: PracticePlan = { ...input, id: makeId(), createdAt: now, updatedAt: now };
  const plans = getPlans();
  plans.push(plan);
  writeJson(PLANS_KEY, plans);
  return plan;
}

export function updatePlan(
  id: string,
  input: PracticePlanInput
): PracticePlan | undefined {
  const plans = getPlans();
  const idx = plans.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  const updated: PracticePlan = { ...plans[idx], ...input, updatedAt: Date.now() };
  plans[idx] = updated;
  writeJson(PLANS_KEY, plans);
  return updated;
}

export function deletePlan(id: string): void {
  const plans = getPlans().filter((p) => p.id !== id);
  writeJson(PLANS_KEY, plans);
}

export function toggleFavoritePlan(id: string): PracticePlan | undefined {
  const plans = getPlans();
  const idx = plans.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  const updated: PracticePlan = { ...plans[idx], favorite: !plans[idx].favorite };
  plans[idx] = updated;
  writeJson(PLANS_KEY, plans);
  return updated;
}

export function makePlanDrillId(): string {
  return makeId();
}
