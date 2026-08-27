import { NavLink } from "react-router-dom";

export function NavBar() {
  return (
    <header className="navbar">
      <div className="navbar-brand">🏐 Practice Plans</div>
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
    </header>
  );
}
