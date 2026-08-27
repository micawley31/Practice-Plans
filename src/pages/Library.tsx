import { useMemo, useState } from "react";
import { CategoryFilter } from "../components/CategoryFilter";
import { DrillCard } from "../components/DrillCard";
import { DrillDetailModal } from "../components/DrillDetailModal";
import { DrillFormModal } from "../components/DrillFormModal";
import * as db from "../storage/db";
import type { Drill, DrillCategory, DrillInput } from "../types";
import { filterDrills } from "../utils/filterDrills";

export function Library() {
  const [drills, setDrills] = useState<Drill[]>(() => db.getDrills());
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<Set<DrillCategory>>(new Set());
  const [detailDrill, setDetailDrill] = useState<Drill | null>(null);
  const [formDrill, setFormDrill] = useState<Drill | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(
    () => filterDrills(drills, query, categories),
    [drills, query, categories]
  );

  function refresh() {
    setDrills(db.getDrills());
  }

  function toggleCategory(category: DrillCategory) {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  function handleSave(input: DrillInput) {
    if (formDrill) {
      db.updateDrill(formDrill.id, input);
    } else {
      db.addDrill(input);
    }
    refresh();
    setShowForm(false);
    setFormDrill(null);
    setDetailDrill(null);
  }

  function handleDelete(drill: Drill) {
    if (!confirm(`Delete "${drill.name}"? This also removes it from any saved plans.`)) {
      return;
    }
    db.deleteDrill(drill.id);
    refresh();
    setDetailDrill(null);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Drill Library</h1>
          <p className="page-subtitle">
            {filtered.length} of {drills.length} drills
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setFormDrill(null);
            setShowForm(true);
          }}
        >
          + Add Drill
        </button>
      </div>

      <input
        className="search-input"
        type="search"
        placeholder="Search by name, description, or keyword…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <CategoryFilter
        selected={categories}
        onToggle={toggleCategory}
        onClear={() => setCategories(new Set())}
      />

      {filtered.length === 0 ? (
        <p className="empty-state">No drills match your search. Try a different keyword or category.</p>
      ) : (
        <div className="drill-grid">
          {filtered.map((drill) => (
            <DrillCard key={drill.id} drill={drill} onClick={() => setDetailDrill(drill)} />
          ))}
        </div>
      )}

      {detailDrill && (
        <DrillDetailModal
          drill={detailDrill}
          onClose={() => setDetailDrill(null)}
          onEdit={() => {
            setFormDrill(detailDrill);
            setShowForm(true);
          }}
          onDelete={() => handleDelete(detailDrill)}
        />
      )}

      {showForm && (
        <DrillFormModal
          initial={formDrill ?? undefined}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setFormDrill(null);
          }}
        />
      )}
    </div>
  );
}
