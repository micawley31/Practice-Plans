import { useState, type ChangeEvent, type FormEvent } from "react";
import { useActiveProfile } from "../contexts/ActiveProfileContext";
import { PencilIcon, UserIcon } from "./icons";

export function ProfileSwitcher() {
  const { profiles, activeProfile, loading, selectProfile, addProfile, renameActiveProfile } =
    useActiveProfile();
  const [mode, setMode] = useState<"view" | "create" | "rename">("view");
  const [name, setName] = useState("");

  if (loading) return null;

  function handleSelect(e: ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    if (id === "__new__") {
      setName("");
      setMode("create");
      return;
    }
    selectProfile(id);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await addProfile(name.trim());
    setMode("view");
  }

  async function handleRename(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await renameActiveProfile(name.trim());
    setMode("view");
  }

  if (mode !== "view" || profiles.length === 0) {
    return (
      <form
        className="profile-switcher"
        onSubmit={mode === "rename" ? handleRename : handleCreate}
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
        {profiles.length > 0 && (
          <button type="button" className="btn-text btn-sm" onClick={() => setMode("view")}>
            Cancel
          </button>
        )}
      </form>
    );
  }

  return (
    <div className="profile-switcher">
      <span aria-hidden="true">
        <UserIcon />
      </span>
      <select className="profile-select" value={activeProfile?.id ?? ""} onChange={handleSelect}>
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
          setName(activeProfile?.name ?? "");
          setMode("rename");
        }}
        aria-label="Rename profile"
      >
        <PencilIcon />
      </button>
    </div>
  );
}
