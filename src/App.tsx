import { Navigate, Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { ToastProvider } from "./components/ToastProvider";
import { useAuth } from "./contexts/AuthContext";
import { Library } from "./pages/Library";
import { Login } from "./pages/Login";
import { PlanBuilder } from "./pages/PlanBuilder";
import { Plans } from "./pages/Plans";

export function App() {
  const { session, loading } = useAuth();

  if (loading) return null;

  if (!session) {
    return (
      <ToastProvider>
        <Login />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
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
    </ToastProvider>
  );
}
