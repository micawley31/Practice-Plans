import { useState, type FormEvent } from "react";
import { useActiveProfile } from "../contexts/ActiveProfileContext";
import type { DrillComment } from "../types";
import { XIcon } from "./icons";

interface Props {
  comments: DrillComment[];
  onAdd: (text: string) => void;
  onDelete: (commentId: string) => void;
}

export function DrillComments({ comments, onAdd, onDelete }: Props) {
  const [text, setText] = useState("");
  const { activeProfile } = useActiveProfile();
  const postingAs = activeProfile?.name ?? "you";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
  }

  const sorted = [...comments].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="comments">
      <h3>Comments{comments.length > 0 && ` (${comments.length})`}</h3>
      {sorted.length === 0 ? (
        <p className="empty-state-inline">
          No comments yet. Share a coaching tip or variation.
        </p>
      ) : (
        <ul className="comment-list">
          {sorted.map((c) => (
            <li className="comment-item" key={c.id}>
              <div className="comment-meta">
                <span className="comment-author">{c.author || "Anonymous"}</span>
                <span className="comment-date">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => onDelete(c.id)}
                  aria-label="Delete comment"
                >
                  <XIcon />
                </button>
              </div>
              <p className="comment-text">{c.text}</p>
            </li>
          ))}
        </ul>
      )}
      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Add a comment (posting as {postingAs})</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Coaching cues, variations, feedback…"
          />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Post Comment
          </button>
        </div>
      </form>
    </div>
  );
}
