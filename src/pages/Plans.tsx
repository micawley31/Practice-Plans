import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as db from "../storage/db";
import type { PracticePlan } from "../types";
import { computeSchedule, formatClock, parseTimeToMinutes } from "../utils/schedule";

function drillCount(plan: PracticePlan): number {
  return plan.segments.reduce((sum, seg) => sum + seg.tracks.length, 0);
}

function timeWindowLabel(plan: PracticePlan): string | undefined {
  if (!plan.startTime || !plan.endTime) return undefined;
  const start = parseTimeToMinutes(plan.startTime);
  const end = parseTimeToMinutes(plan.endTime);
  if (start === undefined || end === undefined) return undefined;
  return `${formatClock(start)} – ${formatClock(end)}`;
}

export function Plans() {
  const [plans, setPlans] = useState<PracticePlan[]>(() => db.getPlans());
  const navigate = useNavigate();

  function handleDelete(plan: PracticePlan) {
    if (!confirm(`Delete practice plan "${plan.name}"?`)) return;
    db.deletePlan(plan.id);
    setPlans(db.getPlans());
  }

  function handleToggleFavorite(plan: PracticePlan) {
    db.toggleFavoritePlan(plan.id);
    setPlans(db.getPlans());
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Practice Plans</h1>
          <p className="page-subtitle">{plans.length} saved plans</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => navigate("/plans/new")}>
          + New Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <p className="empty-state">
          No practice plans yet. Create one and start mixing in drills from your library.
        </p>
      ) : (
        <div className="plan-list">
          {plans.map((plan) => {
            const totalMinutes = computeSchedule(plan.segments).totalMinutes;
            const window = timeWindowLabel(plan);
            return (
              <div className="plan-list-item" key={plan.id}>
                <button
                  type="button"
                  className={plan.favorite ? "btn-icon fav-active" : "btn-icon"}
                  onClick={() => handleToggleFavorite(plan)}
                  aria-label={plan.favorite ? "Remove from favorites" : "Add to favorites"}
                >
                  {plan.favorite ? "★" : "☆"}
                </button>
                <button
                  type="button"
                  className="plan-list-main"
                  onClick={() => navigate(`/plans/${plan.id}`)}
                >
                  <div className="drill-card-header">
                    <span className="drill-card-name">{plan.name}</span>
                    {plan.date && <span className="badge">{plan.date}</span>}
                  </div>
                  <div className="drill-card-meta">
                    {window && <span>🕐 {window}</span>}
                    <span>⏱ {totalMinutes} min total</span>
                    <span>📋 {plan.segments.length} blocks · {drillCount(plan)} drills</span>
                  </div>
                </button>
                <button type="button" className="btn btn-danger" onClick={() => handleDelete(plan)}>
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
