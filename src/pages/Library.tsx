import { useMemo, useState } from "react";
import { DrillCard } from "../components/DrillCard";
import { DrillDetailModal } from "../components/DrillDetailModal";
import { DrillFilterBar } from "../components/DrillFilterBar";
import { DrillFormModal } from "../components/DrillFormModal";
import * as db from "../storage/db";
import type { Drill, DrillCategory, DrillDifficulty, DrillInput } from "../types";
import { filterDrills } from "../utils/filterDrills";
import { toggleInSet } from "../utils/toggleSet";

export function Library() {
  const [drills, setDrills] = useState<Drill[]>(() => db.getDrills());
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<Set<DrillCategory>>(new Set());
  const [difficulties, setDifficulties] = useState<Set<DrillDifficulty>>(new Set());
  const [minRating, setMinRating] = useState(0);
  const [detailDrill, setDetailDrill] = useState<Drill | null>(null);
  const [formDrill, setFormDrill] = useState<Drill | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(
    () => filterDrills(drills, query, categories, difficulties, minRating),
    [drills, query, categories, difficulties, minRating]
  );

  function refresh() {
    setDrills(db.getDrills());
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

  function handleRate(score: number) {
    if (!detailDrill) return;
    const updated = db.rateDrill(detailDrill.id, score);
    refresh();
    if (updated) setDetailDrill(updated);
  }

  function handleAddComment(text: string) {
    if (!detailDrill) return;
    const updated = db.addComment(detailDrill.id, text);
    refresh();
    if (updated) setDetailDrill(updated);
  }

  function handleDeleteComment(commentId: string) {
    if (!detailDrill) return;
    if (!confirm("Delete this comment?")) return;
    const updated = db.deleteComment(detailDrill.id, commentId);
    refresh();
    if (updated) setDetailDrill(updated);
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

      {filtered.length === 0 ? (
        <p className="empty-state">No drills match your search. Try a different keyword or filter.</p>
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
          onRate={handleRate}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
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
