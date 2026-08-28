import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { ActiveProfileProvider } from "./contexts/ActiveProfileContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ActiveProfileProvider>
        <App />
      </ActiveProfileProvider>
    </BrowserRouter>
  </StrictMode>
);
