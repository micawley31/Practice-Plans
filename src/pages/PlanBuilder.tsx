import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CategoryFilter } from "../components/CategoryFilter";
import { DrillCard } from "../components/DrillCard";
import * as db from "../storage/db";
import type { Drill, DrillCategory, PlanDrill } from "../types";
import { filterDrills } from "../utils/filterDrills";

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
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [planDrills, setPlanDrills] = useState<PlanDrill[]>(existing?.drills ?? []);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<Set<DrillCategory>>(new Set());

  const filtered = useMemo(
    () => filterDrills(allDrills, query, categories),
    [allDrills, query, categories]
  );

  const totalMinutes = planDrills.reduce((sum, d) => sum + d.duration, 0);

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

  function addDrill(drill: Drill) {
    setPlanDrills((prev) => [
      ...prev,
      {
        planDrillId: db.makePlanDrillId(),
        drillId: drill.id,
        duration: drill.duration,
        notes: "",
      },
    ]);
  }

  function removeDrill(planDrillId: string) {
    setPlanDrills((prev) => prev.filter((d) => d.planDrillId !== planDrillId));
  }

  function moveDrill(index: number, direction: -1 | 1) {
    setPlanDrills((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function updateDuration(planDrillId: string, duration: number) {
    setPlanDrills((prev) =>
      prev.map((d) => (d.planDrillId === planDrillId ? { ...d, duration } : d))
    );
  }

  function updateNotes(planDrillId: string, notesValue: string) {
    setPlanDrills((prev) =>
      prev.map((d) => (d.planDrillId === planDrillId ? { ...d, notes: notesValue } : d))
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
      notes: notes.trim() || undefined,
      drills: planDrills,
    };
    if (existing) {
      db.updatePlan(existing.id, input);
      navigate("/plans");
    } else {
      const created = db.addPlan(input);
      navigate(`/plans/${created.id}`);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>{existing ? "Edit Practice Plan" : "New Practice Plan"}</h1>
        <button type="button" className="btn" onClick={() => navigate("/plans")}>
          Back to plans
        </button>
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
        <label className="field">
          <span>Notes</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </label>
      </div>

      <div className="plan-builder-layout">
        <section className="plan-builder-column">
          <h2>Drills in this plan</h2>
          <p className="page-subtitle">⏱ {totalMinutes} min total</p>
          {planDrills.length === 0 ? (
            <p className="empty-state">
              No drills added yet. Search the library on the right and click "Add to Plan".
            </p>
          ) : (
            <ol className="plan-drill-list">
              {planDrills.map((pd, index) => {
                const drill = drillsById.get(pd.drillId);
                return (
                  <li className="plan-drill-item" key={pd.planDrillId}>
                    <div className="plan-drill-order">
                      <button
                        type="button"
                        className="btn-icon"
                        disabled={index === 0}
                        onClick={() => moveDrill(index, -1)}
                        aria-label="Move up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        disabled={index === planDrills.length - 1}
                        onClick={() => moveDrill(index, 1)}
                        aria-label="Move down"
                      >
                        ▼
                      </button>
                    </div>
                    <div className="plan-drill-body">
                      <div className="drill-card-header">
                        <span className="drill-card-name">
                          {drill ? drill.name : "(drill removed from library)"}
                        </span>
                        {drill && <span className="badge">{drill.category}</span>}
                      </div>
                      {drill && <p className="drill-card-description">{drill.description}</p>}
                      <div className="field-row">
                        <label className="field">
                          <span>Duration (min)</span>
                          <input
                            type="number"
                            min={1}
                            value={pd.duration}
                            onChange={(e) =>
                              updateDuration(pd.planDrillId, Math.max(1, Number(e.target.value) || 1))
                            }
                          />
                        </label>
                        <label className="field">
                          <span>Notes for this session</span>
                          <input
                            value={pd.notes ?? ""}
                            onChange={(e) => updateNotes(pd.planDrillId, e.target.value)}
                            placeholder="Coaching cues, variations…"
                          />
                        </label>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeDrill(pd.planDrillId)}
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
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
          <input
            className="search-input"
            type="search"
            placeholder="Search by name, description, or keyword…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <CategoryFilter
            selected={categories}
            onToggle={(c) =>
              setCategories((prev) => {
                const next = new Set(prev);
                if (next.has(c)) next.delete(c);
                else next.add(c);
                return next;
              })
            }
            onClear={() => setCategories(new Set())}
          />
          <div className="drill-grid">
            {filtered.map((drill) => (
              <DrillCard
                key={drill.id}
                drill={drill}
                onClick={() => addDrill(drill)}
                action={{ label: "Add to Plan", onClick: addDrill }}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
