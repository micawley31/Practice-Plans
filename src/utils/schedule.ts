import type { PlanSegment } from "../types";

export function parseTimeToMinutes(hhmm: string): number | undefined {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!match) return undefined;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function formatClock(totalMinutes: number): string {
  const h24 = Math.floor(totalMinutes / 60) % 24;
  const m = ((totalMinutes % 60) + 60) % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/** A drill segment runs as long as its longest parallel track (courts sync back up). */
export function segmentDuration(segment: PlanSegment): number {
  if (segment.kind === "break") return segment.duration;
  return segment.tracks.reduce((max, t) => Math.max(max, t.duration), 0);
}

export interface ScheduledSegment {
  segment: PlanSegment;
  duration: number;
  startLabel?: string;
  endLabel?: string;
}

export interface ScheduleSummary {
  scheduled: ScheduledSegment[];
  totalMinutes: number;
  windowMinutes?: number;
  remainingMinutes?: number;
}

export function computeSchedule(
  segments: PlanSegment[],
  startTime?: string,
  endTime?: string
): ScheduleSummary {
  const startMinutes = startTime ? parseTimeToMinutes(startTime) : undefined;
  const endMinutes = endTime ? parseTimeToMinutes(endTime) : undefined;

  let cursor = startMinutes;
  const scheduled: ScheduledSegment[] = segments.map((segment) => {
    const duration = segmentDuration(segment);
    const startLabel = cursor !== undefined ? formatClock(cursor) : undefined;
    const endLabel = cursor !== undefined ? formatClock(cursor + duration) : undefined;
    if (cursor !== undefined) cursor += duration;
    return { segment, duration, startLabel, endLabel };
  });

  const totalMinutes = scheduled.reduce((sum, s) => sum + s.duration, 0);
  const windowMinutes =
    startMinutes !== undefined && endMinutes !== undefined && endMinutes > startMinutes
      ? endMinutes - startMinutes
      : undefined;

  return {
    scheduled,
    totalMinutes,
    windowMinutes,
    remainingMinutes: windowMinutes !== undefined ? windowMinutes - totalMinutes : undefined,
  };
}
