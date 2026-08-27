import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AddTrackPicker } from "../components/AddTrackPicker";
import { DrillCard } from "../components/DrillCard";
import { DrillFilterBar } from "../components/DrillFilterBar";
import * as db from "../storage/db";
import type { Drill, DrillCategory, DrillDifficulty, PlanSegment } from "../types";
import { filterDrills } from "../utils/filterDrills";
import { computeSchedule, formatClock, parseTimeToMinutes } from "../utils/schedule";
import { toggleInSet } from "../utils/toggleSet";

export function PlanBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";
  const existing = useMemo(() => (isNew ? undefined : db.getPlan(id!)), [id, isNew]);

  const [allDrills] = useState<Drill[]>(() => db.getDrills());
  const drillsById = useMemo(() => {
    const map = new Map<string, Drill>();
    allDrills.forEach((d) => map.set(d.id, d));
    return map;
  }, [allDrills]);

  const [name, setName] = useState(existing?.name ?? "");
  const [date, setDate] = useState(existing?.date ?? "");
  const [startTime, setStartTime] = useState(existing?.startTime ?? "");
  const [endTime, setEndTime] = useState(existing?.endTime ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [favorite, setFavorite] = useState(existing?.favorite ?? false);
  const [segments, setSegments] = useState<PlanSegment[]>(existing?.segments ?? []);
  const [error, setError] = useState("");
  const [branchTargetId, setBranchTargetId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<Set<DrillCategory>>(new Set());
  const [difficulties, setDifficulties] = useState<Set<DrillDifficulty>>(new Set());
  const [minRating, setMinRating] = useState(0);

  const filtered = useMemo(
    () => filterDrills(allDrills, query, categories, difficulties, minRating),
    [allDrills, query, categories, difficulties, minRating]
  );

  const schedule = useMemo(
    () => computeSchedule(segments, startTime || undefined, endTime || undefined),
    [segments, startTime, endTime]
  );

  if (!isNew && !existing) {
    return (
      <div className="page">
        <p className="empty-state">That practice plan could not be found.</p>
        <button type="button" className="btn" onClick={() => navigate("/plans")}>
          Back to plans
        </button>
      </div>
    );
  }

  function addBlock(drill: Drill) {
    setSegments((prev) => [
      ...prev,
      {
        segmentId: db.makeId(),
        tracks: [
          {
            trackId: db.makeId(),
            label: "Court 1",
            drillId: drill.id,
            duration: drill.duration,
            notes: "",
          },
        ],
      },
    ]);
  }

  function addTrackToSegment(segmentId: string, drill: Drill) {
    setSegments((prev) =>
      prev.map((seg) =>
        seg.segmentId === segmentId
          ? {
              ...seg,
              tracks: [
                ...seg.tracks,
                {
                  trackId: db.makeId(),
                  label: `Court ${seg.tracks.length + 1}`,
                  drillId: drill.id,
                  duration: drill.duration,
                  notes: "",
                },
              ],
            }
          : seg
      )
    );
    setBranchTargetId(null);
  }

  function removeTrack(segmentId: string, trackId: string) {
    setSegments((prev) =>
      prev
        .map((seg) =>
          seg.segmentId === segmentId
            ? { ...seg, tracks: seg.tracks.filter((t) => t.trackId !== trackId) }
            : seg
        )
        .filter((seg) => seg.tracks.length > 0)
    );
  }

  function removeSegment(segmentId: string) {
    setSegments((prev) => prev.filter((seg) => seg.segmentId !== segmentId));
  }

  function moveSegment(index: number, direction: -1 | 1) {
    setSegments((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function updateTrack(
    segmentId: string,
    trackId: string,
    changes: Partial<{ duration: number; notes: string; label: string }>
  ) {
    setSegments((prev) =>
      prev.map((seg) =>
        seg.segmentId === segmentId
          ? {
              ...seg,
              tracks: seg.tracks.map((t) =>
                t.trackId === trackId ? { ...t, ...changes } : t
              ),
            }
          : seg
      )
    );
  }

  function handleSave() {
    if (!name.trim()) {
      setError("Give your practice plan a name.");
      return;
    }
    const input = {
      name: name.trim(),
      date: date || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      notes: notes.trim() || undefined,
      segments,
      favorite,
    };
    if (existing) {
      db.updatePlan(existing.id, input);
      navigate("/plans");
    } else {
      const created = db.addPlan(input);
      navigate(`/plans/${created.id}`);
    }
  }

  const summaryClass =
    schedule.remainingMinutes === undefined
      ? "schedule-summary"
      : schedule.remainingMinutes < 0
        ? "schedule-summary schedule-summary-over"
        : schedule.remainingMinutes === 0
          ? "schedule-summary schedule-summary-exact"
          : "schedule-summary";

  return (
    <div className="page">
      <div className="page-header">
        <h1>{existing ? "Edit Practice Plan" : "New Practice Plan"}</h1>
        <div className="page-header-actions">
          <button
            type="button"
            className={favorite ? "btn fav-active" : "btn"}
            onClick={() => setFavorite((f) => !f)}
          >
            {favorite ? "★ Favorited" : "☆ Favorite"}
          </button>
          <button type="button" className="btn" onClick={() => navigate("/plans")}>
            Back to plans
          </button>
        </div>
      </div>

      <div className="plan-meta form">
        {error && <div className="form-error">{error}</div>}
        <div className="field-row">
          <label className="field">
            <span>Plan name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tuesday Serve & Pass Focus"
            />
          </label>
          <label className="field">
            <span>Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>
        <div className="field-row">
          <label className="field">
            <span>Practice start time</span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Practice end time</span>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </label>
        </div>
        <label className="field">
          <span>Notes</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </label>
      </div>

      <div className={summaryClass}>
        {schedule.windowMinutes !== undefined ? (
          <>
            <span>
              Practice window: {formatClock(parseTimeToMinutes(startTime)!)} –{" "}
              {formatClock(parseTimeToMinutes(endTime)!)} ({schedule.windowMinutes} min)
            </span>
            <span>Scheduled: {schedule.totalMinutes} min</span>
            {schedule.remainingMinutes !== undefined && schedule.remainingMinutes > 0 && (
              <span>{schedule.remainingMinutes} min unscheduled</span>
            )}
            {schedule.remainingMinutes !== undefined && schedule.remainingMinutes < 0 && (
              <span>{-schedule.remainingMinutes} min over the window</span>
            )}
            {schedule.remainingMinutes === 0 && <span>Fully scheduled ✓</span>}
          </>
        ) : (
          <span>Scheduled: {schedule.totalMinutes} min total (set start/end time to plan every minute)</span>
        )}
      </div>

      <div className="plan-builder-layout">
        <section className="plan-builder-column">
          <h2>Practice schedule</h2>
          {schedule.scheduled.length === 0 ? (
            <p className="empty-state">
              No time blocks yet. Search the library on the right and click "Add to Plan" to
              build your first block.
            </p>
          ) : (
            <ol className="plan-segment-list">
              {schedule.scheduled.map(({ segment, duration, startLabel, endLabel }, index) => (
                <li className="plan-segment" key={segment.segmentId}>
                  <div className="plan-segment-header">
                    <div className="plan-segment-order">
                      <button
                        type="button"
                        className="btn-icon"
                        disabled={index === 0}
                        onClick={() => moveSegment(index, -1)}
                        aria-label="Move block up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        disabled={index === schedule.scheduled.length - 1}
                        onClick={() => moveSegment(index, 1)}
                        aria-label="Move block down"
                      >
                        ▼
                      </button>
                    </div>
                    <div className="plan-segment-time">
                      <span className="plan-segment-title">
                        Block {index + 1}
                        {startLabel && endLabel && ` · ${startLabel} – ${endLabel}`}
                      </span>
                      <span className="page-subtitle">⏱ {duration} min</span>
                    </div>
                    <div className="plan-segment-actions">
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => setBranchTargetId(segment.segmentId)}
                      >
                        + Add Parallel Court
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => removeSegment(segment.segmentId)}
                      >
                        Remove Block
                      </button>
                    </div>
                  </div>

                  <div className="plan-track-grid">
                    {segment.tracks.map((track) => {
                      const drill = drillsById.get(track.drillId);
                      return (
                        <div className="plan-track" key={track.trackId}>
                          {segment.tracks.length > 1 && (
                            <input
                              className="plan-track-label"
                              value={track.label}
                              onChange={(e) =>
                                updateTrack(segment.segmentId, track.trackId, {
                                  label: e.target.value,
                                })
                              }
                              aria-label="Court label"
                            />
                          )}
                          <div className="drill-card-header">
                            <span className="drill-card-name">
                              {drill ? drill.name : "(drill removed from library)"}
                            </span>
                            {drill && (
                              <div className="badge-group">
                                <span className="badge">{drill.category}</span>
                                <span
                                  className={`badge badge-difficulty badge-${drill.difficulty.toLowerCase()}`}
                                >
                                  {drill.difficulty}
                                </span>
                              </div>
                            )}
                          </div>
                          {drill && <p className="drill-card-description">{drill.description}</p>}
                          <div className="field-row">
                            <label className="field">
                              <span>Duration (min)</span>
                              <input
                                type="number"
                                min={1}
                                value={track.duration}
                                onChange={(e) =>
                                  updateTrack(segment.segmentId, track.trackId, {
                                    duration: Math.max(1, Number(e.target.value) || 1),
                                  })
                                }
                              />
                            </label>
                            <label className="field">
                              <span>Notes for this session</span>
                              <input
                                value={track.notes ?? ""}
                                onChange={(e) =>
                                  updateTrack(segment.segmentId, track.trackId, {
                                    notes: e.target.value,
                                  })
                                }
                                placeholder="Coaching cues, variations…"
                              />
                            </label>
                          </div>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => removeTrack(segment.segmentId, track.trackId)}
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ol>
          )}
          <div className="form-actions">
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              Save Practice Plan
            </button>
          </div>
        </section>

        <section className="plan-builder-column">
          <h2>Add drills from library</h2>
          <DrillFilterBar
            query={query}
            onQueryChange={setQuery}
            categories={categories}
            onToggleCategory={(c) => setCategories((prev) => toggleInSet(prev, c))}
            onClearCategories={() => setCategories(new Set())}
            difficulties={difficulties}
            onToggleDifficulty={(d) => setDifficulties((prev) => toggleInSet(prev, d))}
            onClearDifficulties={() => setDifficulties(new Set())}
            minRating={minRating}
            onMinRatingChange={setMinRating}
          />
          <div className="drill-grid">
            {filtered.map((drill) => (
              <DrillCard
                key={drill.id}
                drill={drill}
                onClick={() => addBlock(drill)}
                action={{ label: "Add to Plan", onClick: addBlock }}
              />
            ))}
          </div>
        </section>
      </div>

      {branchTargetId && (
        <AddTrackPicker
          drills={allDrills}
          onPick={(drill) => addTrackToSegment(branchTargetId, drill)}
          onClose={() => setBranchTargetId(null)}
        />
      )}
    </div>
  );
}
