import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as db from "../storage/db";
import type { PracticePlan } from "../types";

function totalDuration(plan: PracticePlan): number {
  return plan.drills.reduce((sum, d) => sum + d.duration, 0);
}

export function Plans() {
  const [plans, setPlans] = useState<PracticePlan[]>(() => db.getPlans());
  const navigate = useNavigate();

  function handleDelete(plan: PracticePlan) {
    if (!confirm(`Delete practice plan "${plan.name}"?`)) return;
    db.deletePlan(plan.id);
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
          {plans.map((plan) => (
            <div className="plan-list-item" key={plan.id}>
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
                  <span>⏱ {totalDuration(plan)} min total</span>
                  <span>📋 {plan.drills.length} drills</span>
                </div>
              </button>
              <button type="button" className="btn btn-danger" onClick={() => handleDelete(plan)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
