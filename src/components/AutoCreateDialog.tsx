import { useState } from "react";
import { DIFFICULTY_LEVELS, DRILL_CATEGORIES, type DrillCategory, type DrillDifficulty } from "../types";
import type { AutoGenerateOptions } from "../utils/autoGeneratePlan";
import { WandIcon } from "./icons";
import { Modal } from "./Modal";

interface Props {
  onGenerate: (options: AutoGenerateOptions) => void;
  onClose: () => void;
}

const DIFFICULTY_OPTIONS = ["Any", ...DIFFICULTY_LEVELS] as const;

export function AutoCreateDialog({ onGenerate, onClose }: Props) {
  const [duration, setDuration] = useState(90);
  const [categories, setCategories] = useState<Set<DrillCategory>>(new Set());
  const [difficulty, setDifficulty] = useState<DrillDifficulty | "Any">("Any");

  function toggleCategory(c: DrillCategory) {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  return (
    <Modal title="Auto-Create Practice Plan" onClose={onClose}>
      <div className="form">
        <label className="field">
          <span>Practice length (minutes)</span>
          <input
            type="number"
            min={15}
            step={5}
            value={duration}
            onChange={(e) => setDuration(Math.max(15, Number(e.target.value) || 15))}
          />
        </label>

        <div className="field">
          <span>Focus categories (optional — leave blank for a balanced mix)</span>
          <div className="chip-row">
            {DRILL_CATEGORIES.map((c) => (
              <button
                type="button"
                key={c}
                className={categories.has(c) ? "chip chip-active" : "chip"}
                onClick={() => toggleCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span>Skill level</span>
          <div className="chip-row">
            {DIFFICULTY_OPTIONS.map((level) => (
              <button
                type="button"
                key={level}
                className={difficulty === level ? "chip chip-active" : "chip"}
                onClick={() => setDifficulty(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <p className="empty-state-inline">
          We'll pick a balanced mix of drills to fill the time, starting with a warm-up and
          ending with team play when it fits. You can edit or rearrange everything afterward.
        </p>

        <div className="form-actions">
          <button type="button" className="btn-text" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary icon-label"
            onClick={() =>
              onGenerate({ durationMinutes: duration, categories: [...categories], difficulty })
            }
          >
            <WandIcon /> Generate Plan
          </button>
        </div>
      </div>
    </Modal>
  );
}
