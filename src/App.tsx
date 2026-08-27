import { Navigate, Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { Library } from "./pages/Library";
import { PlanBuilder } from "./pages/PlanBuilder";
import { Plans } from "./pages/Plans";

export function App() {
  return (
    <div className="app">
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/library" replace />} />
          <Route path="/library" element={<Library />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/plans/new" element={<PlanBuilder />} />
          <Route path="/plans/:id" element={<PlanBuilder />} />
          <Route path="*" element={<Navigate to="/library" replace />} />
        </Routes>
      </main>
    </div>
  );
}
