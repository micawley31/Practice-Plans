import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { DrillCard } from "../components/DrillCard";
import { DrillDetailModal } from "../components/DrillDetailModal";
import { DrillFilterBar } from "../components/DrillFilterBar";
import { DrillFormModal } from "../components/DrillFormModal";
import { SearchIcon } from "../components/icons";
import { useToast } from "../components/ToastProvider";
import * as db from "../storage/db";
import type { Drill, DrillCategory, DrillDifficulty, DrillInput } from "../types";
import { filterDrills } from "../utils/filterDrills";
import { toggleInSet } from "../utils/toggleSet";

const FILTERS_KEY = "practice-plans:libraryFilters";

interface SavedFilters {
  query: string;
  categories: DrillCategory[];
  difficulties: DrillDifficulty[];
  minRating: number;
}

function loadSavedFilters(): SavedFilters | null {
  try {
    const raw = sessionStorage.getItem(FILTERS_KEY);
    return raw ? (JSON.parse(raw) as SavedFilters) : null;
  } catch {
    return null;
  }
}

export function Library() {
  const showToast = useToast();
  const [drills, setDrills] = useState<Drill[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(() => loadSavedFilters()?.query ?? "");
  const [categories, setCategories] = useState<Set<DrillCategory>>(
    () => new Set(loadSavedFilters()?.categories ?? [])
  );
  const [difficulties, setDifficulties] = useState<Set<DrillDifficulty>>(
    () => new Set(loadSavedFilters()?.difficulties ?? [])
  );
  const [minRating, setMinRating] = useState(() => loadSavedFilters()?.minRating ?? 0);
  const [detailDrill, setDetailDrill] = useState<Drill | null>(null);
  const [formDrill, setFormDrill] = useState<Drill | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Drill | null>(null);
  const [confirmCommentId, setConfirmCommentId] = useState<string | null>(null);

  useEffect(() => {
    const toSave: SavedFilters = {
      query,
      categories: [...categories],
      difficulties: [...difficulties],
      minRating,
    };
    sessionStorage.setItem(FILTERS_KEY, JSON.stringify(toSave));
  }, [query, categories, difficulties, minRating]);

  useEffect(() => {
    let active = true;
    db.getDrills().then((loaded) => {
      if (!active) return;
      setDrills(loaded);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () => filterDrills(drills, query, categories, difficulties, minRating),
    [drills, query, categories, difficulties, minRating]
  );

  async function refresh() {
    setDrills(await db.getDrills());
  }

  async function handleSave(input: DrillInput) {
    const isEdit = Boolean(formDrill);
    if (formDrill) {
      await db.updateDrill(formDrill.id, input);
    } else {
      await db.addDrill(input);
    }
    await refresh();
    setShowForm(false);
    setFormDrill(null);
    setDetailDrill(null);
    showToast(isEdit ? "Drill updated" : "Drill added");
  }

  async function handleDeleteConfirmed(drill: Drill) {
    await db.deleteDrill(drill.id);
    await refresh();
    setDetailDrill(null);
    setConfirmTarget(null);
    showToast(`"${drill.name}" deleted`);
  }

  async function handleRate(score: number) {
    if (!detailDrill) return;
    const updated = await db.rateDrill(detailDrill.id, score);
    await refresh();
    if (updated) setDetailDrill(updated);
    showToast("Rating saved");
  }

  async function handleAddComment(text: string) {
    if (!detailDrill) return;
    const updated = await db.addComment(detailDrill.id, text);
    await refresh();
    if (updated) setDetailDrill(updated);
    showToast("Comment added");
  }

  async function handleDeleteCommentConfirmed(commentId: string) {
    if (!detailDrill) return;
    const updated = await db.deleteComment(detailDrill.id, commentId);
    await refresh();
    if (updated) setDetailDrill(updated);
    setConfirmCommentId(null);
    showToast("Comment deleted");
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

      {loading ? (
        <div className="empty-state">
          <p>Loading drills…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <SearchIcon size={36} className="empty-state-icon" />
          <p>No drills match your search. Try a different keyword or filter.</p>
        </div>
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
          onDelete={() => setConfirmTarget(detailDrill)}
          onRate={handleRate}
          onAddComment={handleAddComment}
          onDeleteComment={(commentId) => setConfirmCommentId(commentId)}
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

      {confirmTarget && (
        <ConfirmDialog
          title="Delete drill?"
          message={`Delete "${confirmTarget.name}"? This also removes it from any saved plans.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => handleDeleteConfirmed(confirmTarget)}
          onCancel={() => setConfirmTarget(null)}
        />
      )}

      {confirmCommentId && (
        <ConfirmDialog
          title="Delete comment?"
          message="This comment will be permanently removed."
          confirmLabel="Delete"
          danger
          onConfirm={() => handleDeleteCommentConfirmed(confirmCommentId)}
          onCancel={() => setConfirmCommentId(null)}
        />
      )}
    </div>
  );
}
