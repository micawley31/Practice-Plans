import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as db from "../storage/db";
import type { Profile } from "../types";

interface ActiveProfileContextValue {
  profiles: Profile[];
  activeProfile: Profile | null;
  loading: boolean;
  selectProfile: (id: string) => void;
  addProfile: (name: string) => Promise<Profile>;
  renameActiveProfile: (name: string) => Promise<void>;
}

const ActiveProfileContext = createContext<ActiveProfileContextValue | undefined>(undefined);

export function ActiveProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(() => db.getActiveProfileId());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    db.getProfiles().then((list) => {
      if (!active) return;
      setProfiles(list);
      setLoading(false);
      if (list.length > 0 && !list.some((p) => p.id === activeId)) {
        db.setActiveProfileId(list[0].id);
        setActiveId(list[0].id);
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectProfile(id: string) {
    db.setActiveProfileId(id);
    setActiveId(id);
  }

  async function addProfile(name: string) {
    const created = await db.createProfile(name);
    setProfiles((prev) => [...prev, created]);
    setActiveId(created.id);
    return created;
  }

  async function renameActiveProfile(name: string) {
    if (!activeId) return;
    await db.renameProfile(activeId, name);
    setProfiles((prev) => prev.map((p) => (p.id === activeId ? { ...p, name } : p)));
  }

  const activeProfile = profiles.find((p) => p.id === activeId) ?? null;

  return (
    <ActiveProfileContext.Provider
      value={{ profiles, activeProfile, loading, selectProfile, addProfile, renameActiveProfile }}
    >
      {children}
    </ActiveProfileContext.Provider>
  );
}

export function useActiveProfile(): ActiveProfileContextValue {
  const ctx = useContext(ActiveProfileContext);
  if (!ctx) throw new Error("useActiveProfile must be used within an ActiveProfileProvider");
  return ctx;
}
