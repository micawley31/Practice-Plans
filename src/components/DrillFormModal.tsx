import { useState, type FormEvent } from "react";
import { DIFFICULTY_LEVELS, DRILL_CATEGORIES, type Drill, type DrillDiagram, type DrillInput } from "../types";
import { ConfirmDialog } from "./ConfirmDialog";
import { CourtDiagram } from "./CourtDiagram";
import { DiagramEditor } from "./DiagramEditor";
import { Modal } from "./Modal";

interface Props {
  initial?: Drill;
  onSave: (input: DrillInput) => void;
  onClose: () => void;
}

interface FormShape {
  name: string;
  category: string;
  difficulty: string;
  description: string;
  tags: string[];
  duration: number;
  participants: string;
  equipment: string;
  videoUrl: string;
  diagram: DrillDiagram | undefined;
}

function formShapeOf(initial?: Drill): FormShape {
  return {
    name: initial?.name ?? "",
    category: initial?.category ?? DRILL_CATEGORIES[0],
    difficulty: initial?.difficulty ?? DIFFICULTY_LEVELS[0],
    description: initial?.description ?? "",
    tags: initial?.tags ?? [],
    duration: initial?.duration ?? 10,
    participants: initial?.participants ?? "",
    equipment: initial?.equipment ?? "",
    videoUrl: initial?.videoUrl ?? "",
    diagram: initial?.diagram,
  };
}

function snapshot(shape: FormShape): string {
  return JSON.stringify({ ...shape, tags: shape.tags.join(", ") });
}

export function DrillFormModal({ initial, onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? DRILL_CATEGORIES[0]);
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? DIFFICULTY_LEVELS[0]);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [duration, setDuration] = useState(initial?.duration ?? 10);
  const [participants, setParticipants] = useState(initial?.participants ?? "");
  const [equipment, setEquipment] = useState(initial?.equipment ?? "");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [diagram, setDiagram] = useState<DrillDiagram | undefined>(initial?.diagram);
  const [showDiagramEditor, setShowDiagramEditor] = useState(false);
  const [error, setError] = useState("");
  const [initialSnapshot] = useState(() => snapshot(formShapeOf(initial)));
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const isDirty =
    snapshot({
      name,
      category,
      difficulty,
      description,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      duration,
      participants,
      equipment,
      videoUrl,
      diagram,
    }) !== initialSnapshot;

  function requestClose() {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Drill name is required.");
      return;
    }
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }
    onSave({
      name: name.trim(),
      category,
      difficulty,
      description: description.trim(),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      duration: Math.max(1, Number(duration) || 1),
      participants: participants.trim() || undefined,
      equipment: equipment.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      diagram,
    });
  }

  return (
    <Modal title={initial ? "Edit Drill" : "Add Drill"} onClose={requestClose}>
      <form className="form" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}
        <label className="field">
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </label>
        <div className="field-row">
          <label className="field">
            <span>Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
            >
              {DRILL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Difficulty</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
            >
              {DIFFICULTY_LEVELS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="field">
          <span>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </label>
        <label className="field">
          <span>Keywords / tags (comma separated)</span>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. serve receive, platform, fundamentals"
          />
        </label>
        <div className="field-row">
          <label className="field">
            <span>Duration (minutes)</span>
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span>Participants</span>
            <input
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="e.g. 6-8 players"
            />
          </label>
        </div>
        <label className="field">
          <span>Equipment</span>
          <input
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            placeholder="e.g. cart of balls, cones"
          />
        </label>
        <label className="field">
          <span>Video link (optional)</span>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="YouTube, Vimeo, or any video URL"
          />
        </label>
        <div className="field">
          <span>Diagram (optional)</span>
          {diagram && (diagram.players.length > 0 || diagram.arrows.length > 0) ? (
            <CourtDiagram diagram={diagram} className="diagram-preview" />
          ) : null}
          <div className="diagram-field-actions">
            <button type="button" className="btn btn-sm" onClick={() => setShowDiagramEditor(true)}>
              {diagram && (diagram.players.length > 0 || diagram.arrows.length > 0)
                ? "Edit Diagram"
                : "+ Add Diagram"}
            </button>
            {diagram && (diagram.players.length > 0 || diagram.arrows.length > 0) && (
              <button
                type="button"
                className="btn-text btn-sm"
                onClick={() => setDiagram(undefined)}
              >
                Remove
              </button>
            )}
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn-text" onClick={requestClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {initial ? "Save Changes" : "Add Drill"}
          </button>
        </div>
      </form>
      {showDiscardConfirm && (
        <ConfirmDialog
          title="Discard changes?"
          message="You have unsaved changes to this drill. Discard them?"
          confirmLabel="Discard"
          danger
          onConfirm={onClose}
          onCancel={() => setShowDiscardConfirm(false)}
        />
      )}
      {showDiagramEditor && (
        <DiagramEditor
          initial={diagram}
          onSave={(d) => {
            setDiagram(d);
            setShowDiagramEditor(false);
          }}
          onClose={() => setShowDiagramEditor(false)}
        />
      )}
    </Modal>
  );
}
