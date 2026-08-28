import { NavLink } from "react-router-dom";
import { ProfileSwitcher } from "./ProfileSwitcher";

export function NavBar() {
  return (
    <header className="navbar">
      <div className="navbar-brand">🏐 Practice Plans</div>
      <div className="navbar-right">
        <nav className="navbar-links">
          <NavLink
            to="/library"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Drill Library
          </NavLink>
          <NavLink
            to="/plans"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Practice Plans
          </NavLink>
        </nav>
        <ProfileSwitcher />
      </div>
    </header>
  );
}
