import { useAuth } from "../contexts/AuthContext";
import { UserIcon } from "./icons";

export function AccountMenu() {
  const { user, displayName, signOut } = useAuth();
  if (!user) return null;

  return (
    <div className="profile-switcher">
      <span aria-hidden="true">
        <UserIcon />
      </span>
      <span className="account-name">{displayName ?? user.email}</span>
      <button type="button" className="btn-text btn-sm" onClick={() => signOut()}>
        Sign out
      </button>
    </div>
  );
}
