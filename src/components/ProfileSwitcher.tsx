import { useState, type ChangeEvent, type FormEvent } from "react";
import * as db from "../storage/db";

export function ProfileSwitcher() {
  const [profiles] = useState(() => db.getProfiles());
  const [active] = useState(() => db.getActiveProfile());
  const [mode, setMode] = useState<"view" | "create" | "rename">("view");
  const [name, setName] = useState("");

  function handleSelect(e: ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    if (id === "__new__") {
      setName("");
      setMode("create");
      return;
    }
    db.setActiveProfile(id);
    window.location.reload();
  }

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    db.createProfile(name.trim());
    window.location.reload();
  }

  function handleRename(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    db.renameProfile(active.id, name.trim());
    window.location.reload();
  }

  if (mode !== "view") {
    return (
      <form
        className="profile-switcher"
        onSubmit={mode === "create" ? handleCreate : handleRename}
      >
        <input
          autoFocus
          className="profile-name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Save
        </button>
        <button type="button" className="btn btn-sm" onClick={() => setMode("view")}>
          Cancel
        </button>
      </form>
    );
  }

  return (
    <div className="profile-switcher">
      <span aria-hidden="true">👤</span>
      <select className="profile-select" value={active.id} onChange={handleSelect}>
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
        <option value="__new__">+ New profile…</option>
      </select>
      <button
        type="button"
        className="btn-icon"
        onClick={() => {
          setName(active.name);
          setMode("rename");
        }}
        aria-label="Rename profile"
      >
        ✎
      </button>
    </div>
  );
}
