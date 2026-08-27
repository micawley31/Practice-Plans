import { seedDrills } from "../data/seedDrills";
import type {
  Drill,
  DrillInput,
  PracticePlan,
  PracticePlanInput,
} from "../types";

const DRILLS_KEY = "practice-plans:drills";
const PLANS_KEY = "practice-plans:plans";

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

function ensureSeeded(): void {
  if (localStorage.getItem(DRILLS_KEY)) return;
  const now = Date.now();
  const drills: Drill[] = seedDrills.map((d) => ({
    ...d,
    id: makeId(),
    createdAt: now,
    updatedAt: now,
  }));
  writeJson(DRILLS_KEY, drills);
}

export function getDrills(): Drill[] {
  ensureSeeded();
  return readJson<Drill[]>(DRILLS_KEY, []).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export function getDrill(id: string): Drill | undefined {
  return getDrills().find((d) => d.id === id);
}

export function addDrill(input: DrillInput): Drill {
  const now = Date.now();
  const drill: Drill = { ...input, id: makeId(), createdAt: now, updatedAt: now };
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

export function getPlans(): PracticePlan[] {
  return readJson<PracticePlan[]>(PLANS_KEY, []).sort(
    (a, b) => b.updatedAt - a.updatedAt
  );
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

export function makePlanDrillId(): string {
  return makeId();
}
