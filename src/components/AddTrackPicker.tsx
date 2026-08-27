import { useMemo, useState } from "react";
import type { Drill, DrillCategory, DrillDifficulty } from "../types";
import { filterDrills } from "../utils/filterDrills";
import { toggleInSet } from "../utils/toggleSet";
import { DrillCard } from "./DrillCard";
import { DrillFilterBar } from "./DrillFilterBar";
import { Modal } from "./Modal";

interface Props {
  drills: Drill[];
  onPick: (drill: Drill) => void;
  onClose: () => void;
}

export function AddTrackPicker({ drills, onPick, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<Set<DrillCategory>>(new Set());
  const [difficulties, setDifficulties] = useState<Set<DrillDifficulty>>(new Set());
  const [minRating, setMinRating] = useState(0);

  const filtered = useMemo(
    () => filterDrills(drills, query, categories, difficulties, minRating),
    [drills, query, categories, difficulties, minRating]
  );

  return (
    <Modal title="Add a Parallel Court" onClose={onClose}>
      <p className="empty-state-inline">
        Pick a drill to run at the same time on another court or station.
      </p>
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
        <p className="empty-state">No drills match your search or filters.</p>
      ) : (
        <div className="drill-grid">
          {filtered.map((drill) => (
            <DrillCard
              key={drill.id}
              drill={drill}
              onClick={() => onPick(drill)}
              action={{ label: "Add to This Block", onClick: onPick }}
            />
          ))}
        </div>
      )}
    </Modal>
  );
}
